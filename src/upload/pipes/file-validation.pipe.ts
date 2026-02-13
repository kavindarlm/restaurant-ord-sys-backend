import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ];
  
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  private readonly maxSizeInBytes = 5 * 1024 * 1024; // 5MB

  async transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file size
    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException(
        `File size exceeds limit of ${this.maxSizeInBytes / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type from multer
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Validate file extension
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed extensions: ${this.allowedExtensions.join(', ')}`,
      );
    }

    // Validate buffer exists
    if (!file.buffer) {
      throw new BadRequestException('File buffer is not available. Please ensure the file is properly uploaded.');
    }

    // Magic number validation for common image formats
    const fileSignature = file.buffer.slice(0, 4).toString('hex');
    const jpegSignature = 'ffd8ffe0'; // JPEG
    const jpegSignature2 = 'ffd8ffe1'; // JPEG (EXIF)
    const pngSignature = '89504e47'; // PNG
    const webpSignature = file.buffer.slice(0, 12).toString('hex');
    
    const isJpeg = fileSignature.startsWith('ffd8');
    const isPng = fileSignature === pngSignature;
    const isWebp = webpSignature.includes('57454250'); // 'WEBP' in hex
    
    if (!isJpeg && !isPng && !isWebp) {
      throw new BadRequestException(
        'File content does not match image format. Possible file spoofing detected.',
      );
    }

    return file;
  }
}
