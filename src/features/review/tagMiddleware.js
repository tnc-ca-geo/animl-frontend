import { tagsAdded, editTag } from './reviewSlice';

export const tagMiddleware = (store) => (next) => (action) => {
  /* tagsAdded */

  if (tagsAdded.match(action)) {
    next(action);
    store.dispatch(
      editTag('create', {
        tags: action.payload.tags,
      }),
    );
  } else {
    next(action);
  }
};
