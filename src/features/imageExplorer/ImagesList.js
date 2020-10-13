import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchImages,
  selectFilters,
  selectImages,
} from './imagesSlice';

import { Grid, Row, Col } from '../../components/Grid';

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
            {img.hash} - {img.cameraSn}
          </li>
        )}
      </ul>
    </Grid>
  );
};

export default ImagesList;

