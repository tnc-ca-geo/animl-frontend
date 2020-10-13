import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchImages,
  selectFilters,
  selectImages,
} from './imagesSlice';

import { Grid, Row, Col } from '../../components/Grid';
import { IMAGE_BUCKET_URL } from '../../config';

const ImagesList = () => {
  const filters = useSelector(selectFilters);
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('fetching images');
    dispatch(fetchImages(filters));
  }, [filters, dispatch])


  return (
    <Grid>
      <ul>
        {images.map((img) =>
          <li key={img.hash} >
            <img
              src={IMAGE_BUCKET_URL + 'thumbnails/' + img.hash + '-small.jpg'}
            /> 
              {img.hash} - {img.cameraSn}
          </li>
        )}
      </ul>
    </Grid>
  );
};

export default ImagesList;

