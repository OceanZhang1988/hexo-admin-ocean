import { WebApi } from './WebApi';
import { IDeploy } from '../models/IDeploy';

export class DeployService extends WebApi {

  public deploy(message: string) {
    return this.requestPost<IDeploy>('/deploy', { message });
  }
}

export const deployService = new DeployService();
