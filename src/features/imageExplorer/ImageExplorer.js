import React from 'react';
import { Grid, Row, Col } from '../../components/Grid';
import CameraFilter from './CameraFilter';
import ImagesList from './ImagesList';

export function ImageExplorer() {

  return (
    <Grid>
      <Row>
        Filters
        <CameraFilter />
      </Row>
      <Row>
        Image List
        <ImagesList />
      </Row>
    </Grid>
  );
}
