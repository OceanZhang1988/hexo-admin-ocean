import request from 'superagent';

export class WebApi {

  public getApiUrl(subPath) {
    const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
    let rootPath = '';
    if (url.includes('admin')) {
      rootPath = url.slice(0, url.indexOf('admin')).join('/');
    }
    return rootPath + '/admin/api' + subPath;
  }

  public requestPost<T>(url = '', data = {}) {
    return new Promise<T>((resolve, reject) => {
      request
        .post(this.getApiUrl(url))
        .send(data)
        .then((res) => {
          resolve(res.body);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public requestGet<T>(url = '', params = {}) {
    return new Promise<T>((resolve, reject) => {
      request
        .get(this.getApiUrl(url))
        .query(params)
        .then((res) => {
          resolve(res.body);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
