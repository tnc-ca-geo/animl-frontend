import React from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../theme/GlobalStyle';
import theme from '../theme'; 
import {
  Switch,
  Route
} from 'react-router-dom';
import NavBar from '../components/NavBar';
import CounterPage from '../pages/CounterPage';
import HomePage from '../pages/HomePage';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <GlobalStyle />
        <NavBar />
        <Switch>
          <Route path="/counter">
            <CounterPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </div>
    </ThemeProvider>
  );
}

export default App;
