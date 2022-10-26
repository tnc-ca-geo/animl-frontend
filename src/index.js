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

// Not 100% sure hot reloading App is working without losing redux state...
// https://github.com/supasate/connected-react-router/blob/master/FAQ.md#how-to-hot-reload-functional-components
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./app/App', render);
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
