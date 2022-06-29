import React, { useState, useEffect } from 'react';
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
import { selectRouterLocation } from '../features/images/imagesSlice';
import {
  selectUserAuthState,
  selectUserUsername,
  userAuthStateChanged
} from '../features/user/userSlice';
import logo from '../assets/animl-logo.svg';
import { IN_MAINTENANCE_MODE } from '../config';


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

const MainenanceMessage = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: '$3',
  fontSize: '$5',
  padding: '$5 $0',

  '&::after': {
    content: '\\1F9EC',
    paddingLeft: '$2',
    fontSize: '30px'
  }
});

const StyledMaintenanceAlert = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '100px',
});

const MaintenanceAlert = () => (
  <StyledMaintenanceAlert>
    <img
      alt='Animl'
      src={logo}
      width='300'
    />
    <MainenanceMessage>
      Animl is undergoing evolution. Check back soon!
    </MainenanceMessage>
  </StyledMaintenanceAlert>
);

const App = () => {
  globalStyles();
  const authState = useSelector(selectUserAuthState);
  const user = useSelector(selectUserUsername);
  const dispatch = useDispatch();

  // check for maintenance mode
  const router = useSelector(selectRouterLocation);
  const [ maintenanceMode, setMaintenanceMode ] = useState(IN_MAINTENANCE_MODE);
  useEffect(() => {
    if ('maintenance-mode' in router.query){
      setMaintenanceMode(router.query['maintenance-mode']);
    }
  }, [ router ]);

  // set auth state
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

  return (
    <>
      {maintenanceMode === true
        ? <MaintenanceAlert/>
        : authState === AuthState.SignedIn && user ? (
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
          )
      }
    </>  
  );
}

export default App;
