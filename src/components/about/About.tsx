import { Component } from 'react';
import { IRouteProps } from '../IRouteProps';

export class About extends Component<IRouteProps, any> {
  public render() {
    return (
      <div className="about">
        <h1>This is the Hexo Admin Plugin</h1>
        <p><strong>Goal: </strong><br />
          Provide an awesome admin experience for managing your blog.</p>
        <div><strong> Useful links:</strong>
          <ul>
            <li><a href="http://hexo.io">Hexo site</a></li>
            <li><a href="https://github.com/tianyingchun/hexo-admin-tm">Github page for this plugin</a></li>
          </ul>
        </div>
      </div>
    );
  }
}
