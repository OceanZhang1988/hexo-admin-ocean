import { WebApi } from './WebApi';
import { IPage } from 'src/models/IPage';
import { ITagCategoriesMetadata } from '../models/ITagCategoryMetadata';

interface IPageSave {
  page: IPage;
  tagsCategoriesAndMetadata: ITagCategoriesMetadata;
}
export class PageService extends WebApi {

  public newPage(title) {
    return this.requestPost<IPage>('/pages/new', { title });
  }

  public pages() {
    return this.requestGet<IPage[]>('/pages/list');
  }

  public pageSave(id, data) {
    return this.requestPost<IPageSave>('/pages/' + id, data);
  }

  public pageGet(id) {
    return this.requestGet<IPage>('/pages/' + id);
  }

  public publish(id) {
    return this.requestPost<IPage>('/posts/' + id + '/publish');
  }

  public unpublish(id) {
    return this.requestPost<IPage>('/posts/' + id + '/unpublish');
  }
}

export const pageService = new PageService();
