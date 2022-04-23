import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import globalStyles from '../theme/globalStyles';
import { styled } from '../theme/stitches.config.js';
import { Switch, Route } from 'react-router-dom';
import NavBar from '../components/NavBar';
import HomePage from '../pages/HomePage';
import Amplify from 'aws-amplify';
import awsconfig from '../aws-exports';
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';
import {
  selectUserAuthState,
  selectUserUsername,
  userAuthStateChanged
} from '../features/user/userSlice';
import logo from '../assets/animl-logo.svg';


Amplify.configure(awsconfig);

const LoginScreen = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

const Logo = styled('div', {
  position: 'absolute',
  top: '100px',
});

const AppContainer = styled('div', {
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '100%',
  height: '100vh',
});

const App = () => {
  globalStyles();
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
    <Tooltip.Provider>
      <Toast.Provider>
        <AppContainer>
          <NavBar />
          <Switch>
            <Route path="/">
              <HomePage />
            </Route>
          </Switch>
        </AppContainer>
      </Toast.Provider>
    </Tooltip.Provider>
  ) : (
    <LoginScreen>
      <Logo>
        <img
          alt='Animl'
          src={logo}
          width='300'
        />
      </Logo>
      <AmplifyAuthenticator hideDefault={true}/>
    </LoginScreen>
  );
}

export default App;
