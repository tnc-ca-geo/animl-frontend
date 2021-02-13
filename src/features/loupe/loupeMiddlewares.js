
import {
  incrementIndex,
  incrementImagesIndex,
  incrementLabelsIndex,
  selectIndex
} from './loupeSlice';
import { selectImages } from '../images/imagesSlice';

export const incrementLoupeIndexMiddleware = store => next => action => {

  if (incrementIndex.match(action)) {
    console.log('incrementIndex payload: ', action.payload)
    let { delta, unit } = action.payload;
    const images = selectImages(store.getState());
    const index = selectIndex(store.getState());
    const labelCount = images[index.images].labels.length;
    console.log('index: ', index);
    console.log('labelCount: ', labelCount);
    if (unit === 'images') {
      store.dispatch(incrementImagesIndex(action.payload));
    }
    else if (unit === 'labels' && delta === 'increment') {
      index.labels >= labelCount -1
        ? store.dispatch(incrementImagesIndex(action.payload))
        : store.dispatch(incrementLabelsIndex(action.payload));
    }
    else if (unit === 'labels' && delta === 'decrement') {
      index.labels === 0
        ? store.dispatch(incrementImagesIndex(action.payload))
        : store.dispatch(incrementLabelsIndex(action.payload));
    }
  }

  next(action);
};