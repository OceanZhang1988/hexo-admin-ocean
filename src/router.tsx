import { Route, Switch } from 'react-router-dom';
import { Post, Posts } from './components/post';
import { Page, Pages } from './components/page';
import { About } from './components/about';
import { Deploy } from './components/deploy';
import { Settings, AuthSetup } from './components/setting';

export default () => {
  return (
          <Switch>
              <Route render={(props) => <Post {...props} />} path="/posts/:postId" />
              <Route render={(props) => <Page {...props} />} path="/pages/:pageId" />
              <Route render={(props) => <Pages {...props} />} path="/pages" />
              <Route render={(props) => <About {...props} />} path="/about" />
              <Route render={(props) => <Deploy {...props} />} path="/deploy" />
              <Route render={(props) => <Settings {...props} />} path="/settings" />
              <Route render={(props) => <AuthSetup {...props} />} path="/auth-setup" />
              <Route render={(props) => <Posts {...props} />} path="/" />
          </Switch>

  );
};
