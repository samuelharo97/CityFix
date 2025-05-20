# Storage Module

This module provides a storage service with the ability to save files either locally or to AWS S3.

## Configuration

The storage type is controlled via the `STORAGE_TYPE` environment variable in the `.env` file.

### Local Storage (Default)

For local development, files are stored in the `uploads` directory. Set the following in your `.env` file:

```
STORAGE_TYPE=local
UPLOAD_DIR=uploads
API_URL=http://localhost:3000
```

### S3 Storage

For production, files are stored in AWS S3. Set the following in your `.env` file:

```
STORAGE_TYPE=s3
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
```

## Usage

The storage service is automatically injected into the `ReportsController` and handles file uploads based on the configuration.

## File Types

The service is configured to accept the following file types:

- Images: JPG, JPEG, PNG
- Videos: MP4, MOV, AVI

## File Size Limits

The maximum file size is configured in the `.env` file via the `MAX_FILE_SIZE` variable. The default is 5MB.
