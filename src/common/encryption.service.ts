import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  // Use environment variable in production
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'your-32-character-secret-key!!'; // Must be 32 chars for AES-256
  private readonly IV_LENGTH = 16; // For AES, this is always 16

  /**
   * Encrypt a table ID or cart ID
   */
  encrypt(id: number | string): string {
    try {
      const text = id.toString();
      const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return IV + encrypted data (IV needed for decryption)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt an encrypted ID back to original number
   */
  decrypt(encryptedText: string): number {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];
      const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const id = parseInt(decrypted, 10);
      if (isNaN(id)) {
        throw new Error('Decrypted value is not a valid number');
      }
      
      return id;
    } catch (error) {
      throw new Error('Decryption failed or invalid token');
    }
  }

  /**
   * Validate if a string is a valid encrypted ID
   */
  isValidEncryptedId(encryptedText: string): boolean {
    try {
      this.decrypt(encryptedText);
      return true;
    } catch {
      return false;
    }
  }
}
