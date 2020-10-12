import React from 'react';
import {
  Switch,
  Route
} from 'react-router-dom';
import NavBar from '../components/NavBar';
import CounterPage from '../pages/CounterPage';
import HomePage from '../pages/HomePage';

const App = () => {
  return (
    <>
      <NavBar />
      <Switch>
        <Route path="/counter">
          <CounterPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </>
  );
}

export default App;
