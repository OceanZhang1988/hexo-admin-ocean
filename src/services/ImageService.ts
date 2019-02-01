import { WebApi } from './WebApi';
import { IImage } from 'src/models/IImage';

export class ImageService extends WebApi {

  public uploadImage(data: string, filename: string) {
    return this.requestPost<IImage>('/images/upload', { data, filename });
  }
}

export const imageService = new ImageService();
