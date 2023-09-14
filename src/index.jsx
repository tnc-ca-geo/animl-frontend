import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Authenticator } from '@aws-amplify/ui-react';
import { Theme } from '@radix-ui/themes';
import store, { history } from './app/store';
import App from './app/App.jsx'
import './assets/fontawesome';
import '@radix-ui/themes/styles.css';

const render = () => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Authenticator.Provider>
            <Theme>
              <App />
            </Theme>
          </Authenticator.Provider>
        </ConnectedRouter>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

render();

