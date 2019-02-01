import { Component } from 'react';
import { Link } from 'react-router-dom';

export class Header extends Component<any, any> {
  private activeRoute(routeName) {
    if (location.hash === '#/' && routeName === '/posts') {
      return 'active';
    }
    return window.location.href.indexOf(routeName) > -1 ? 'active' : '';
  }
  public render() {
    return (
      <ul className="app_nav" >
        <li className={this.activeRoute('/posts')}><Link to="/posts">Posts</Link></li>
        <li className={this.activeRoute('/pages')}><Link to="/pages">Pages</Link></li>
        <li className={this.activeRoute('/about')}><Link to="/about">About</Link></li>
        <li className={this.activeRoute('/deploy')}><Link to="/deploy">Deploy</Link></li>
        <li className={this.activeRoute('/settings')}><Link to="/settings">Settings</Link></li>
      </ul>
    );
  }
}
