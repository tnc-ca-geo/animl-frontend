import React from 'react';
import { Page } from '../components/Page';
import Breadcrumbs from '../components/Breadcrumbs';
import { ImageExplorer } from '../features/imageExplorer/ImageExplorer';

const HomePage = () => {
  return (
    <Page>
      {/*<Breadcrumbs />*/}
      <ImageExplorer />
    </Page>
  );
}

export default HomePage;
