import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import {
  selectUserAuthState,
  selectUserUsername,
  userAuthStateChanged
} from '../features/user/userSlice';

Amplify.configure(awsconfig);

const AppContainer = styled.div({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '100%',
  height: '100vh',
});

const App = () => {
  const authState = useSelector(selectUserAuthState);
  const user = useSelector(selectUserUsername);
  const dispatch = useDispatch();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      const payload = { nextAuthState };
      if (authData) {
        const idToken = authData.signInUserSession.idToken.payload;
        payload.username = idToken['cognito:username'];
        payload.groups = idToken['cognito:groups'];
      }
      dispatch(userAuthStateChanged(payload));
    });
  }, [dispatch]);

  return authState === AuthState.SignedIn && user ? (
    <AppContainer>
      <NavBar />
      <Switch>
        <Route path="/counter">
          <CounterPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </AppContainer>
  ) : (
    <AmplifyAuthenticator hideDefault={true}/>
  );
}

export default App;
