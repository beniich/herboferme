/**
 * services/apiKeyService.ts
 * API key lifecycle management.
 * Raw keys are NEVER stored â€” only SHA-256 HMAC hashes.
 * The raw key is returned ONCE at generation and never again.
 */
import crypto from 'crypto';
import { Types } from 'mongoose';
import { ApiKey, IApiKey, ApiKeyScope } from '../models/ApiKey.js';
import { NotFoundAppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

interface GenerateApiKeyOptions {
  orgId: string;
  createdBy: string;
  name: string;
  scopes?: ApiKeyScope[];
  rateLimit?: number;
  expiresInDays?: number;
}

interface GenerateApiKeyResult {
  rawKey: string;   // Shown ONCE â€” caller must display to user
  apiKey: IApiKey;
}

function hashApiKey(raw: string): string {
  return crypto
    .createHmac('sha256', process.env.API_KEY_SALT!)
    .update(raw)
    .digest('hex');
}

function generateRawKey(): string {
  // Format: rt_<48-byte-hex> â€” recognizable prefix for secret scanning
  return `rt_${crypto.randomBytes(32).toString('hex')}`;
}

export const apiKeyService = {
  /**
   * Generate a new API key.
   * Returns the raw key ONCE â€” store securely on client side.
   */
  async generateApiKey(opts: GenerateApiKeyOptions): Promise<GenerateApiKeyResult> {
    const rawKey = generateRawKey();
    const keyHash = hashApiKey(rawKey);

    const expiresAt = opts.expiresInDays
      ? new Date(Date.now() + opts.expiresInDays * 86400_000)
      : undefined;

    const apiKey = await ApiKey.create({
      orgId: new Types.ObjectId(opts.orgId),
      keyHash,
      name: opts.name,
      scopes: opts.scopes ?? ['complaints:read'],
      rateLimit: opts.rateLimit ?? 60,
      createdBy: new Types.ObjectId(opts.createdBy),
      expiresAt,
      isActive: true,
    });

    logger.info('[apiKeyService] API key generated', {
      keyId: apiKey._id,
      orgId: opts.orgId,
      name: opts.name,
      // Never log rawKey or keyHash
    });

    return { rawKey, apiKey };
  },

  /**
   * Validate an incoming raw API key.
   * Updates lastUsedAt on success.
   */
  async validateApiKey(rawKey: string): Promise<IApiKey | null> {
    const keyHash = hashApiKey(rawKey);
    const apiKey = await ApiKey.findOne({ keyHash, isActive: true });

    if (!apiKey) return null;

    // Check expiry
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      logger.warn('[apiKeyService] Expired API key presented', { keyId: apiKey._id });
      return null;
    }

    // Update lastUsedAt (fire-and-forget)
    ApiKey.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() }).exec();

    return apiKey;
  },

  /**
   * Rotate an API key â€” revoke old, issue new.
   * Returns the new raw key (shown ONCE).
   */
  async rotateApiKey(keyId: string, requestingUserId: string): Promise<GenerateApiKeyResult> {
    const existing = await ApiKey.findById(keyId);
    if (!existing) throw new NotFoundAppError('API Key');

    // Revoke old key
    existing.isActive = false;
    await existing.save();

    // Issue new key with same settings
    return this.generateApiKey({
      orgId: existing.orgId.toString(),
      createdBy: requestingUserId,
      name: `${existing.name} (rotated)`,
      scopes: existing.scopes as ApiKeyScope[],
      rateLimit: existing.rateLimit,
    });
  },

  /**
   * Revoke an API key by ID.
   */
  async revokeApiKey(keyId: string): Promise<void> {
    const result = await ApiKey.findByIdAndUpdate(keyId, { isActive: false });
    if (!result) throw new NotFoundAppError('API Key');
    logger.info('[apiKeyService] API key revoked', { keyId });
  },

  /** List all active API keys for an organization */
  async listOrgKeys(orgId: string): Promise<IApiKey[]> {
    return ApiKey.find({ orgId: new Types.ObjectId(orgId) })
      .select('-keyHash') // Never expose hash
      .sort({ createdAt: -1 })
      .lean() as unknown as IApiKey[];
  },
};
