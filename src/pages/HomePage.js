import React from 'react';
import { Page } from '../components/Page';
import { ViewExplorer } from '../features/viewsManager/ViewExplorer';

const HomePage = () => {
  return (
    <Page>
      <ViewExplorer />
    </Page>
  );
}

export default HomePage;
