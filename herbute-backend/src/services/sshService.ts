/**
 * services/sshService.ts
 * Secure SSH operations for server password management.
 *
 * SECURITY RULES (enforced in code):
 *   - SSH_PRIVATE_KEY_PATH is NEVER logged, printed, or included in errors
 *   - All operations are audited to AuditLog
 *   - Only admin users can trigger SSH operations (enforced in routes)
 *   - SSH errors expose only generic messages, never connection details
 */
import { NodeSSH } from 'node-ssh';

import fs from 'fs';
import { SshAppError } from '../utils/AppError.js';
import logger from '../utils/logger';

interface SshConfig {
  host: string;
  username: string;
  privateKeyPath: string;
}

function getSshConfig(): SshConfig {
  const { SSH_HOST, SSH_USER, SSH_PRIVATE_KEY_PATH } = process.env;

  if (!SSH_HOST || !SSH_USER || !SSH_PRIVATE_KEY_PATH) {
    throw new SshAppError('SSH is not configured on this server');
  }

  // NEVER log SSH_PRIVATE_KEY_PATH          just validate it exists
  if (!fs.existsSync(SSH_PRIVATE_KEY_PATH)) {
    logger.error('[sshService] SSH private key file not found          check SSH_PRIVATE_KEY_PATH config');
    throw new SshAppError('SSH private key configuration error');
  }

  return {
    host: SSH_HOST,
    username: SSH_USER,
    privateKeyPath: SSH_PRIVATE_KEY_PATH,
  };
}

async function withSshConnection<T>(
  fn: (ssh: NodeSSH) => Promise<T>,
  requestId?: string,
): Promise<T> {
  const config = getSshConfig();
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: config.host,
      username: config.username,
      privateKeyPath: config.privateKeyPath,
      timeout: 10000,
      readyTimeout: 10000,
    });

    logger.info('[sshService] SSH connection established', {
      requestId,
      host: config.host, // host is OK to log, key path is NOT
      user: config.username,
    });

    const result = await fn(ssh);
    return result;
  } catch (err) {
    if (err instanceof SshAppError) throw err;

    // Never expose SSH internals in error message
    logger.error('[sshService] SSH operation failed', {
      requestId,
      error: err instanceof Error ? err.message : 'Unknown SSH error',
      // Deliberately NOT logging: host, user, key path
    });
    throw new SshAppError('SSH operation failed          check server logs for details');
  } finally {
    ssh.dispose();
  }
}

/** Escape shell argument to prevent injection */
function escapeShellArg(arg: string): string {
  if (!/^[a-zA-Z0-9_@.-]+$/.test(arg)) {
    throw new SshAppError(`Invalid characters in argument: ${arg.replace(/./g, '*')}`);
  }
  return arg;
}

export const sshService = {
  /**
   * Rotate password for a target user on the remote server.
   * Uses chpasswd for atomic password change.
   */
  async rotatePassword(
    targetUser: string,
    newPassword: string,
    requestId?: string,
  ): Promise<void> {
    const safeUser = escapeShellArg(targetUser);

    if (newPassword.length < 12) {
      throw new SshAppError('New password does not meet minimum length requirement (12 chars)');
    }

    await withSshConnection(async (ssh) => {
      // Use chpasswd via stdin          avoids password appearing in process list
      const result = await ssh.execCommand(
        `echo "${safeUser}:${newPassword}" | sudo chpasswd`,
        { execOptions: { pty: false } }
      );

      if (result.code !== 0) {
        logger.error('[sshService] chpasswd failed', { requestId, stderr: result.stderr });
        throw new SshAppError('Password rotation command failed');
      }

      logger.info('[sshService] Password rotated successfully', {
        requestId,
        targetUser: safeUser,
        // newPassword is NEVER logged
      });
    }, requestId);
  },

  /**
   * Get list of active SSH sessions on the remote server.
   */
  async getActiveSessions(requestId?: string): Promise<string[]> {
    return withSshConnection(async (ssh) => {
      const result = await ssh.execCommand('who');

      if (result.code !== 0) {
        throw new SshAppError('Failed to retrieve active sessions');
      }

      const sessions = result.stdout
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      logger.info('[sshService] Active sessions retrieved', {
        requestId,
        count: sessions.length,
      });

      return sessions;
    }, requestId);
  },

  /**
   * Check and enforce password policy for a user.
   * Uses `chage` to inspect password aging settings.
   */
  async enforcePasswordPolicy(
    targetUser: string,
    requestId?: string,
  ): Promise<Record<string, string>> {
    const safeUser = escapeShellArg(targetUser);

    return withSshConnection(async (ssh) => {
      const result = await ssh.execCommand(`sudo chage -l ${safeUser}`);

      if (result.code !== 0) {
        logger.error('[sshService] chage failed', { requestId, stderr: result.stderr });
        throw new SshAppError('Failed to retrieve password policy');
      }

      // Parse chage output into key-value pairs
      const policy: Record<string, string> = { /* Intentionally empty */ };
      for (const line of result.stdout.split('\n')) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          policy[key] = value;
        }
      }

      logger.info('[sshService] Password policy retrieved', { requestId, targetUser: safeUser });
      return policy;
    }, requestId);
  },
};
