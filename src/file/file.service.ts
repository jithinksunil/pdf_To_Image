import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class FileService {
  constructor(private config: ConfigService) {
    const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
    const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
    this.s3 = new S3({
      accessKeyId,
      secretAccessKey,
    });
    console.log({
      accessKeyId,
      secretAccessKey,
    });
    
  }
  private s3: S3;

  async uploadFile(buffer: Buffer, organizationName: string, name: string) {
    const bucket = this.config.get('AWS_BUCKET_NAME');
    const date = new Date();
    const prepend = String(date.getTime());

    const params: S3.PutObjectRequest = {
      Bucket: bucket,
      Key: `${organizationName.split(' ').join('_')}/${String(
        `${prepend}_${name}`,
      )}`,
      Body: buffer,
      ACL: 'public-read',
    };
    const data = await this.s3.upload(params).promise();
    return {
      file: data.Location,
      key: data.Key,
    };
  }

  async deleteFile(key: string) {
    const bucket = this.config.get('AWS_BUCKET_NAME');
    const params: S3.DeleteObjectRequest = {
      Bucket: bucket,
      Key: key,
    };
    const data = await this.s3.deleteObject(params).promise();
    return { data };
  }

  async getPublicUrl(key: string) {
    const bucket = this.config.get('AWS_BUCKET_NAME');
    const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
    const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
    const s3 = new S3({
      accessKeyId,
      secretAccessKey,
    });

    const params = {
      Bucket: bucket,
      Key: key,
    };
    const url = await s3.getSignedUrlPromise('getObject', params);
    return { url };
  }
}
