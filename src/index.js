import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Authenticator } from '@aws-amplify/ui-react';
import * as serviceWorker from './serviceWorker';
import store, { history } from './app/store';
import './assets/fontawesome';

const render = () => {
  const App = require('./app/App').default;

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Authenticator.Provider>
            <App />
          </Authenticator.Provider>
        </ConnectedRouter>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

render();

