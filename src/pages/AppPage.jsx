import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserUsername, selectUserAuthStatus } from '../features/auth/authSlice.js';
import { Page } from '../components/Page.jsx';
import ViewExplorer from '../features/projects/ViewExplorer.jsx';
import LoginForm from '../features/auth/LoginForm.jsx';

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
