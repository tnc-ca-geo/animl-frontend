import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import globalStyles from '../theme/globalStyles';
import { styled } from '../theme/stitches.config.js';
import { Switch, Route } from 'react-router-dom';
import NavBar from '../components/NavBar';
import HomePage from '../pages/HomePage';
import CaseStudiesPage from '../pages/CaseStudiesPage';
import AppPage from '../pages/AppPage';
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';
import { initTracking } from '../features/tracking/trackingSlice';
import { selectRouterLocation } from '../features/images/imagesSlice';
import { userAuthStateChanged } from '../features/user/userSlice';
import logo from '../assets/animl-logo.svg';
import { IN_MAINTENANCE_MODE, GA_CONFIG } from '../config';

Amplify.configure(awsconfig);

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

  // set auth state
  // TODO: move to to AppPage?
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

  useEffect(() => {
    dispatch(initTracking(GA_CONFIG));
  }, [ dispatch ]);

  return (
    <>
      {maintenanceMode === true
        ? (<MaintenanceAlert/>)
        : (<Tooltip.Provider>
            <Toast.Provider>
              <AppContainer>
                <NavBar />
                <Switch>
                  <Route exact path="/" component={HomePage} />
                  <Route path="/app" component={AppPage} />
                  <Route path="/case-studies" component={CaseStudiesPage} />
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
