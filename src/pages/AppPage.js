import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserUsername, selectUserAuthStatus } from '../features/user/userSlice.js';
import { Page } from '../components/Page';
import ViewExplorer from '../features/projects/ViewExplorer';
import LoginForm from '../features/user/LoginForm';

const AppPage = () => {
  const authStatus = useSelector(selectUserAuthStatus);
  const user = useSelector(selectUserUsername);
  const signedIn = authStatus === 'authenticated' && user;

  return (
    <Page>
      {signedIn ? <ViewExplorer /> : <LoginForm />}
    </Page>
  );
};

export default AppPage;
