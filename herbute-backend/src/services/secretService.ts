import crypto from 'crypto';
import { Secret } from '../models/Secret.js';

const ENCRYPTION_KEY = process.env.SECRET_ENCRYPTION_KEY || 'your-default-32-char-key-here-!!!'; // Must be 32 chars
const IV_LENGTH = 16;

export class SecretService {
  private encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  async getSecrets(organizationId: string) {
    const secrets = await Secret.find({ organizationId }).select('-value');
    return secrets;
  }

  async createSecret(data: any, createdBy: string, organizationId: string) {
    const encryptedValue = this.encrypt(data.value);
    const secret = await Secret.create({
      ...data,
      value: encryptedValue,
      createdBy,
      organizationId,
    });
    return secret;
  }

  async revealSecret(id: string, organizationId: string) {
    const secret = await Secret.findOne({ _id: id, organizationId });
    if (!secret) throw new Error('Secret not found');

    secret.lastAccessed = new Date();
    await secret.save();

    return {
      ...secret.toObject(),
      value: this.decrypt(secret.value),
    };
  }

  async deleteSecret(id: string, organizationId: string) {
    return await Secret.deleteOne({ _id: id, organizationId });
  }

  async getSecretStats(organizationId: string) {
    const secrets = await Secret.find({ organizationId });
    return {
      total: secrets.length,
      byCategory: secrets.reduce((acc: any, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {}),
      expiringSoon: secrets.filter(
        (s) => s.expiresAt && new Date(s.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
      ).length,
    };
  }
}

export const secretService = new SecretService();
