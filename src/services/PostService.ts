import { WebApi } from './WebApi';
import { IPost } from 'src/models/IPost';
import { ITagCategoriesMetadata } from 'src/models/ITagCategoryMetadata';
interface IPostSave {
  post: IPost;
  tagsCategoriesAndMetadata: ITagCategoriesMetadata;
}
export class PostService extends WebApi {

  public posts() {
    return this.requestGet<IPost[]>('/posts/list');
  }

  public postSave(id, data) {
    return this.requestPost<IPostSave>('/posts/' + id, data);
  }
  public postGet(id) {
    return this.requestGet<IPost>('/posts/' + id);
  }

  public newPost(title) {
    return this.requestPost<IPost>('/posts/new', { title });
  }

  public remove(id) {
    return this.requestPost<IPost>('/posts/' + id + '/remove');
  }

  public publish(id) {
    return this.requestPost<IPost>('/posts/' + id + '/publish');
  }

  public unpublish(id) {
    return this.requestPost<IPost>('/posts/' + id + '/unpublish');
  }

  public renamePost(id, filename) {
    return this.requestPost<IPost>('/posts/' + id + '/rename', {
      filename,
    });
  }
}

export const postService = new PostService();
