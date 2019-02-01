import { WebApi } from './WebApi';
import { ITagCategoriesMetadata } from '../models/ITagCategoryMetadata';

export class CommonService extends WebApi {

  public tagsCategoriesAndMetadata() {
    return this.requestGet<ITagCategoriesMetadata>('/tags-categories-and-metadata');
  }
}

export const commonService = new CommonService();
