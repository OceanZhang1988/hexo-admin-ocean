import './less/index.less';
import ReactDOM from 'react-dom';
import App from './components/app';
import routes from './router';
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App routes={routes()} />, document.getElementById('app'));
});
