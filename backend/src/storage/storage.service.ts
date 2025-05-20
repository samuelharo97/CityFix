import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private storageType: string;
  private uploadDir: string;
  private s3Bucket: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    this.apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3000'
    );

    if (this.storageType === 's3') {
      this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET');
      this.s3Client = new S3Client({
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>(
            'AWS_SECRET_ACCESS_KEY'
          )
        }
      });
    }

    // Ensure upload directory exists for local storage
    if (this.storageType === 'local' && !fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (this.storageType === 's3') {
      return this.saveToS3(file);
    } else {
      return this.saveToLocal(file);
    }
  }

  private async saveToLocal(file: Express.Multer.File): Promise<string> {
    // Generate a unique filename
    const filename = this.generateFilename(file.originalname);

    // Create the file path
    const filepath = path.join(this.uploadDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Write the file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Return the URL
    return `${this.apiUrl}/${this.uploadDir}/${filename}`;
  }

  private async saveToS3(file: Express.Multer.File): Promise<string> {
    const key = `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await this.s3Client.send(command);

    // Return the S3 URL
    return `https://${this.s3Bucket}.s3.amazonaws.com/${key}`;
  }

  getStorageType(): string {
    return this.storageType;
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  generateFilename(originalname: string): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(originalname);
    return `${uniqueSuffix}${ext}`;
  }

  isFileTypeAllowed(mimetype: string): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo' // .avi
    ];
    return allowedMimeTypes.includes(mimetype);
  }
}
