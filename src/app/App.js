import React from 'react';
import globalStyles from '../theme/globalStyles';
import { styled, css } from '../theme/stitches.config.js';
import {
  Switch,
  Route
} from 'react-router-dom';
import NavBar from '../components/NavBar';
import CounterPage from '../pages/CounterPage';
import HomePage from '../pages/HomePage';
import Amplify from 'aws-amplify';
import awsconfig from '../aws-exports';
import { AmplifyAuthenticator, AmplifySignOut, AmplifySignIn } from "@aws-amplify/ui-react";
Amplify.configure(awsconfig);

const AppContainer = styled.div({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '100%',
  height: '100vh',
});

const App = () => {

  return (

    <AppContainer>

      <AmplifyAuthenticator>
        <AmplifySignIn slot="sign-in"><div slot="secondary-footer-content"></div></AmplifySignIn>
        <AmplifySignOut />
        <NavBar />
        <Switch>
          <Route path="/counter">
            <CounterPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </AmplifyAuthenticator>
    </AppContainer>
  );
}

export default App;
