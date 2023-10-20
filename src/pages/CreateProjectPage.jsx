import React from 'react';
import { useSelector } from 'react-redux';

import { Page } from '../components/Page.jsx';
import { NotFound } from '../components/NotFound.jsx'
import { selectUserUsername, selectUserAuthStatus, selectUserIsSuperUser } from '../features/user/userSlice.js';
import LoginForm from '../features/user/LoginForm.jsx';
import CreateProjectForm from '../features/projects/CreateProjectForm.jsx';

const CreateProjectPage = () => {
  const authStatus = useSelector(selectUserAuthStatus);
  const user = useSelector(selectUserUsername);
  const isSuperUser = useSelector(selectUserIsSuperUser);
  const signedIn = authStatus === 'authenticated' && user;

  if (!signedIn) {
    return <Page><LoginForm /></Page>;
  }

  return (
    <Page>
      {isSuperUser ? <CreateProjectForm /> : <NotFound />}
    </Page>
  )
}

export default CreateProjectPage;
