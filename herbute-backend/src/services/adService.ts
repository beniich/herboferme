import ActiveDirectory from 'activedirectory2';
import ADSyncLog from '../models/ADSyncLog.js';
import { Membership } from '../models/Membership.js';
import { User } from '../models/user.model.js';

interface ADConfig {
  url: string;
  baseDN: string;
  username: string;
  password: string;
}

interface ADUser {
  dn: string;
  cn: string;
  sAMAccountName: string;
  userPrincipalName?: string;
  givenName?: string;
  sn?: string;
  mail?: string;
  telephoneNumber?: string;
  memberOf?: string[] | string;
}

export class ActiveDirectoryService {
  private ad: any;
  private ldapClient: any;
  private config: ADConfig;

  constructor(config: ADConfig) {
    this.config = config;

    // Initialize ActiveDirectory library for easier querying
    this.ad = new ActiveDirectory({
      url: config.url,
      baseDN: config.baseDN,
      username: config.username,
      password: config.password,
      attributes: {
        user: [
          'cn',
          'sAMAccountName',
          'mail',
          'memberOf',
          'telephoneNumber',
          'givenName',
          'sn',
          'userPrincipalName',
        ],
        group: ['cn', 'description'],
      },
    });
  }

  // Check connection
  async checkConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      this.ad.findUser(this.config.username, (err: any) => {
        if (err) {
          console.error('AD Connection Check Failed:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Authenticate user
  async authenticateUser(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ad.authenticate(username, password, (err: any, auth: boolean) => {
        if (err) {
          console.error('AD Auth Error:', err);
          resolve(false);
          return;
        }
        resolve(auth);
      });
    });
  }

  // Get all users
  async getAllUsers(): Promise<ADUser[]> {
    return new Promise((resolve, reject) => {
      const query = '(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))'; // Enable users only
      this.ad.findUsers(query, (err: any, users: ADUser[]) => {
        if (err) reject(err);
        resolve(users || []);
      });
    });
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<ADUser | null> {
    return new Promise((resolve, reject) => {
      this.ad.findUser(username, (err: any, user: ADUser) => {
        if (err) reject(err);
        resolve(user || null);
      });
    });
  }

  // Get user groups
  async getUserGroups(username: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.ad.getGroupMembershipForUser(username, (err: any, groups: any[]) => {
        if (err) reject(err);
        resolve(groups?.map((g) => g.cn) || []);
      });
    });
  }

  // Sync users to MongoDB
  async syncToMongoDB(organizationId: string): Promise<{
    imported: number;
    updated: number;
    errors: any[];
  }> {
    const results = { imported: 0, updated: 0, errors: [] as any[] };
    let users: ADUser[] = [];

    try {
      users = await this.getAllUsers();
    } catch (error: any) {
      console.error('Failed to fetch users from AD:', error);
      throw new Error('Failed to fetch users from AD: ' + error.message);
    }

    const startTime = Date.now();

    for (const adUser of users) {
      try {
        if (!adUser.sAMAccountName) continue;

        const groups = await this.getUserGroups(adUser.sAMAccountName);
        const role = this.mapGroupsToRole(groups);

        // Ensure email exists or create a fake one based on usage
        const email = adUser.mail || `${adUser.sAMAccountName}@reclamtrack.local`.toLowerCase();

        // Check if user exists
        const existingUser = await User.findOne({
          $or: [{ email: email }, { adUsername: adUser.sAMAccountName }],
        });

        if (existingUser) {
          // Update
          await User.findByIdAndUpdate(existingUser._id, {
            firstName: adUser.givenName || adUser.cn.split(' ')[0],
            lastName: adUser.sn || adUser.cn.split(' ').slice(1).join(' '),
            phone: adUser.telephoneNumber,
            adSyncedAt: new Date(),
            adGroups: groups,
          });

          // Ensure membership exists
          const membership = await Membership.findOne({
            userId: existingUser._id,
            organizationId,
          });

          if (!membership) {
            await Membership.create({
              userId: existingUser._id,
              organizationId,
              roles: [role],
              status: 'active',
            });
          } else if (!membership.roles || !membership.roles.includes(role)) {
            // Update role if changed in AD
            // Note: Usually we might want to manually manage keys, but let's sync for now
            // await Membership.findByIdAndUpdate(membership._id, { roles: [role] });
          }

          results.updated++;
        } else {
          // Create new User
          const newUser = await User.create({
            email,
            password: 'AD_AUTH_USER', // Placeholder, they authenticate against AD
            firstName: adUser.givenName || adUser.cn.split(' ')[0],
            lastName: adUser.sn || adUser.cn.split(' ').slice(1).join(' ') || 'User',
            phone: adUser.telephoneNumber,
            role,
            adUsername: adUser.sAMAccountName,
            adSyncedAt: new Date(),
            adGroups: groups,
            authMethod: 'ad',
            isVerified: true,
          });

          // Create membership
          await Membership.create({
            userId: newUser._id,
            organizationId,
            roles: [role],
            status: 'active',
          });
          results.imported++;
        }
      } catch (error: any) {
        results.errors.push({
          username: adUser.sAMAccountName,
          error: error.message,
        });
      }
    }

    // Log sync
    await ADSyncLog.create({
      organizationId,
      syncType: 'manual',
      action: results.errors.length > 0 ? 'error' : 'imported',
      totalProcessed: users.length,
      successful: results.imported + results.updated,
      failed: results.errors.length,
      changes: {
        imported: results.imported,
        updated: results.updated,
        disabled: 0,
      },
      duration: Date.now() - startTime,
      syncErrors: results.errors,
    });

    return results;
  }

  // Map AD groups to ReclamTrack roles
  private mapGroupsToRole(groups: string[]): string {
    const normalizedGroups = groups.map((g) => g.toLowerCase());

    if (normalizedGroups.some((g) => g.includes('admin') || g.includes('domain admins'))) {
      return 'admin';
    } else if (normalizedGroups.some((g) => g.includes('manager'))) {
      return 'manager';
    } else if (normalizedGroups.some((g) => g.includes('support') || g.includes('agent'))) {
      return 'agent';
    } else {
      return 'citizen'; // default role
    }
  }
}

export default ActiveDirectoryService;
