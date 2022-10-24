import ReactGA from 'react-ga4';
import { LOCATION_CHANGE } from 'connected-react-router';
import { initTracking, setCurrentPage, selectCurrentPage, selectTrackingInitialized } from './trackingSlice';

export const trackingMiddleware = store => next => action => {

  if (initTracking.match(action)) {
    next(action);
    const { trackingId, gaOptions } = action.payload;
    ReactGA.initialize(trackingId, { gaOptions });
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    store.dispatch(setCurrentPage(window.location.pathname));
  }

  if (action.type === LOCATION_CHANGE) {
    next(action);
    if (selectTrackingInitialized(store.getState())) {
      const currLocation = selectCurrentPage(store.getState());
      const newLocation = action.payload.location.pathname;
      if (newLocation !== currLocation) {
        store.dispatch(setCurrentPage(newLocation));
        ReactGA.send({ hitType: 'pageview', page: newLocation });
      }
    }
  }

  else {
    next(action);
  }
};
