/* @refresh reload */
import './index.css';
import { Router, Route } from '@solidjs/router';
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './app';
import PostPage from './post-page';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error('Root element not found. Did you forget to add it to your index.html?');
}

render(
  () => (
    <Router>
      <Route path='/' component={App} />
      <Route path='/post' component={PostPage} />
    </Router>
  ),
  root!,
);
