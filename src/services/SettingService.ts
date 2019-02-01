import { WebApi } from './WebApi';
import { ISetting } from 'src/models/ISetting';

interface ISettingSet {
  updated: string;
  settings: ISetting;
}
export class SettingService extends WebApi {

  public settings() {
    return this.requestGet<ISetting>('/settings/list');
  }

  public setSetting(name, value, addedOptions?) {
    return this.requestPost<ISettingSet>('/settings/set', {
      name,
      value,
      addedOptions,
    });
  }
}

export const settingService = new SettingService();
