import React from 'react';
import globalStyle from '../theme/globalStyle';
import { styled, css } from '../theme/stitches.config.js';
import {
  Switch,
  Route
} from 'react-router-dom';
import NavBar from '../components/NavBar';
import CounterPage from '../pages/CounterPage';
import HomePage from '../pages/HomePage';

const AppContainer = styled.div({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '100%',
  height: '100vh',
});

const App = () => {

  return (
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
  );
}

export default App;
