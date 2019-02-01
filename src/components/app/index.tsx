import './index.less';
import { hot } from 'react-hot-loader';
import { Component } from 'react';
import { Header } from '../shared/Header';
import { BrowserRouter } from 'react-router-dom';

class App extends Component<any, any> {
  public render() {
    return (
      <BrowserRouter basename={'/admin'}>
        <div className="app">
          <div className="app_header">
            <img src="logo.png" className="app_logo" />
            <span className="app_title">Hexo Admin</span>
            <Header {...this.props} />
          </div>
          <div className="app_main">
            {this.props.routes}
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
(async () => {
  console.log('You have async support if you read this instead of "ReferenceError: regeneratorRuntime is not defined" error.');
})();

export default hot(module)(App) as any;
