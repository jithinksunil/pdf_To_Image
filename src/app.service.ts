import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as pdftopic from 'pdftopic';
import * as cloudinary from 'cloudinary';
@Injectable()
export class AppService {
  constructor() {
    cloudinary.v2.config({
      cloud_name: 'df8w69xon',
      api_key: '818129511951146',
      api_secret: '_R4yasVlyG3hpD01R8M1Fbz4i6I',
    });
  }
  async getImagesFromPdf(signedUrl: string) {
    const response = await axios.get(signedUrl, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(response.data, 'binary');
    const imageBuffers = await pdftopic.pdftobuffer(buffer, 'all');
    const uploadPromises = imageBuffers.map((buffer) =>
      this.uploadToCloud(buffer),
    );
    const uploads = (await Promise.allSettled(uploadPromises))
      .filter((promise) => promise.status == 'fulfilled')
      .map(
        (promise) =>
          (promise as any).value as { public_id: string; url: string },
      );
    return {
      images: uploads.map(({ public_id, url }) => ({
        publicId: public_id,
        url,
      })),
    };
  }

  async deleteImages(imageIds: string[]) {
    const deletePromise = imageIds.map((id) => this.deleteFromCloud(id));
    await Promise.all(deletePromise);
    return { status: 'OK' };
  }
  async uploadToCloud(buffer: Buffer) {
    return new Promise<{ public_id: string; url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: 'convertedPitches' },
          (error: any, result: { public_id: string; url: string }) => {
            if (error) {
              return reject('Files connot be uploaded');
            }
            resolve(result);
          },
        );
        uploadStream.end(buffer);
      },
    );
  }
  async deleteFromCloud(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.destroy(
        publicId,
        (error: any, result: { public_id: string }) => {
          if (error) {
            return reject('File cannot be deleted');
          }
          resolve(result);
        },
      );
    });
  }
}
