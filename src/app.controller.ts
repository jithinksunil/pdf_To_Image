import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/convert-to-images')
  getImagesFromPdf(@Body() body:{signedUrl:string}) {
    return this.appService.getImagesFromPdf(body.signedUrl);
  }
  @Post('/delete-converted-images')
  deleteImages(@Body() body:string[]) {
    return this.appService.deleteImages(body);
  }
}
