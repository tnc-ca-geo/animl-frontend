import React from 'react';
import { Grid, Row, Col } from '../../components/Grid';
import CameraFilter from './CameraFilter';
import DateCreatedFilter from './DateCreatedFilter';
import ImagesList from './ImagesList';

export function ImageExplorer() {

  return (
    <Grid>
      <h3>Cameras</h3>
      <Row>
        <CameraFilter />
      </Row>
      <h3>Date Created</h3>
      <Row>
        <DateCreatedFilter />
      </Row>
      <h3>Images List</h3>
      <Row>
        <ImagesList />
      </Row>
    </Grid>
  );
}
