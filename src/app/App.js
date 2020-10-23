import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import globalStyle from '../theme/globalStyle';
import { styled, css } from '../theme/stitches.config.js';
import {
  Switch,
  Route
} from 'react-router-dom';
import { screenResized } from '../features/ui/uiSlice';
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

  const [ resizeTimeout, setResizeTimeout ] = useState();
  const dispatch = useDispatch();

  // Listen for resize events
  useEffect(() => {    
    function throttleResize(event) {
      if (!resizeTimeout) {
        const resizeTimeout = setTimeout(function() {
          setResizeTimeout(null);
          dispatch(screenResized({ width: window.innerWidth }));
        }, 100);
        setResizeTimeout(resizeTimeout);
      }
    };
    dispatch(screenResized({ width: window.innerWidth }));
    window.addEventListener('resize', throttleResize);
    return () => { window.removeEventListener('resize', throttleResize) }
  });

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
