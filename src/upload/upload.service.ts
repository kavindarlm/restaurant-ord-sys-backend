import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;
  private readonly bucketName = 'restaurant-img'; // Your existing bucket name

  constructor() {
    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Upload file to Supabase Storage
   * @param file - The validated file from multer
   * @param folder - Optional folder path in bucket (e.g., 'dishes', 'categories')
   * @returns Public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ url: string; path: string }> {
    try {
      // Generate unique filename to prevent overwrites and script execution
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = folder
        ? `${folder}/${uniqueFileName}`
        : uniqueFileName;

      // Upload to Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false, // Prevent overwriting existing files
          cacheControl: '3600',
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new InternalServerErrorException(
          `Failed to upload file: ${error.message}`,
        );
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Delete file from Supabase Storage
   * @param filePath - The file path in the bucket
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new InternalServerErrorException(
          `Failed to delete file: ${error.message}`,
        );
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Upload dish image
   */
  async uploadDishImage(file: Express.Multer.File): Promise<string> {
    const result = await this.uploadFile(file, 'dishes');
    return result.url;
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(file: Express.Multer.File): Promise<string> {
    const result = await this.uploadFile(file, 'categories');
    return result.url;
  }
}
