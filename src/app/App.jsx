import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import globalStyles from '../theme/globalStyles';
import { styled } from '../theme/stitches.config.js';
import { Switch, Route } from 'react-router-dom';
import NavBar from '../components/NavBar';
import HomePage from '../pages/HomePage';
import CaseStudiesPage from '../pages/CaseStudiesPage';
import AppPage from '../pages/AppPage';
import CreateProjectPage from '../pages/CreateProjectPage';
import { Amplify } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';
import { initTracking } from '../features/tracking/trackingSlice';
import { selectRouterLocation } from '../features/images/imagesSlice';
import { userAuthStateChanged } from '../features/auth/authSlice';
import { mouseEventDetected, selectIsDrawingBbox } from '../features/loupe/loupeSlice';
import logo from '../assets/animl-logo.svg';
import { IN_MAINTENANCE_MODE, GA_CONFIG, AWS_AUTH_CONFIG } from '../config';

Amplify.configure(AWS_AUTH_CONFIG);

const AppContainer = styled('div', {
  position: 'relative',
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
  const dispatch = useDispatch();

  // check for maintenance mode
  const router = useSelector(selectRouterLocation);
  const [ maintenanceMode, setMaintenanceMode ] = useState(IN_MAINTENANCE_MODE);
  useEffect(() => {
    if ('maintenance-mode' in router.query){
      setMaintenanceMode(router.query['maintenance-mode']);
    }
  }, [ router ]);

  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const { user } = useAuthenticator(context => [context.user]);
  useEffect(() => {
    const payload = { authStatus };
    if (user && authStatus === 'authenticated') {
      const idToken = user.signInUserSession.idToken.payload;
      payload.username = idToken['cognito:username'];
      payload.groups = idToken['cognito:groups'];
    }
    dispatch(userAuthStateChanged(payload));
  }, [user, authStatus, dispatch]);

  // // set auth state
  // // TODO: move to to AppPage?
  // useEffect(() => {
  //   return onAuthUIStateChange((nextAuthState, authData) => {
  //     console.log('auth state changed; nextAuthState: ', nextAuthState);
  //     console.log('authdata: ', authData);
  //     const payload = { nextAuthState };
  //     if (authData) {
  //       const idToken = authData.signInUserSession.idToken.payload;
  //       payload.username = idToken['cognito:username'];
  //       payload.groups = idToken['cognito:groups'];
  //     }
  //     dispatch(userAuthStateChanged(payload));
  //   });
  // }, [dispatch]);

  // Monitor connection loss
  useEffect(() => {
    const handleOffline = (e) => {
      const now = new Date();
      console.log(`Lost internet connection at ${now.toISOString()}`);
    }
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('offline', handleOffline) }
  }, []);

  useEffect(() => {
    const handleOnline = (e) => {
      const now = new Date();
      console.log(`Regained internet connection at ${now.toISOString()}`);
    }
    window.addEventListener('online', handleOnline);
    return () => { window.removeEventListener('online', handleOnline) }
  }, []);

  useEffect(() => {
    dispatch(initTracking(GA_CONFIG));
  }, [ dispatch ]);

  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const handleMouseUp = () => {
    if (isDrawingBbox) dispatch(mouseEventDetected({ event: 'mouse-up'}));
  };
  const handleMouseDown = () => {
    if (isDrawingBbox) dispatch(mouseEventDetected({ event: 'mouse-down'}));
  }

  return (
    <>
      {maintenanceMode === true
        ? (<MaintenanceAlert/>)
        : (
          <Tooltip.Provider>
            <Toast.Provider>
              <AppContainer
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                css={isDrawingBbox && { userSelect: 'none' }}
              >
                <NavBar />
                <Switch>
                  <Route exact path="/" component={HomePage} />
                  <Route path="/app" component={AppPage} />
                  <Route path="/case-studies" component={CaseStudiesPage} />
                  <Route path="/create-project" component={CreateProjectPage} />
                  {/*<Route component={NoMatch} />*/}
                </Switch>
              </AppContainer>
            </Toast.Provider>
          </Tooltip.Provider>)
      }
    </>  
  );
};

export default App;
