import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '../theme/stitches.config.js';
import { Page } from '../components/Page.jsx';
import { NotFound } from '../components/NotFound.jsx';
import {
  selectUserUsername,
  selectUserAuthStatus,
  selectUserIsSuperUser,
} from '../features/auth/authSlice.js';
import LoginForm from '../features/auth/LoginForm.jsx';
import CreateProjectForm from '../features/projects/CreateProjectForm.jsx';
import EditProjectForm from '../features/projects/EditProjectForm.jsx';
import SuccessToast from '../components/SuccessToast.jsx';
import ErrorToast from '../components/ErrorToast.jsx';

const PageWrapper = styled('div', {
  maxWidth: '600px',
  padding: '0 $5',
  width: '100%',
  margin: '0 auto',
});

const TabBar = styled('div', {
  display: 'flex',
  gap: '$3',
  paddingTop: '$8',
  borderBottom: '1px solid $border',
});

const Tab = styled('button', {
  padding: '$2 $4',
  fontSize: '$4',
  fontWeight: '$5',
  fontFamily: '$roboto',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: '$textMedium',
  marginBottom: '-1px',
  '&:hover': {
    color: '$textDark',
  },
  variants: {
    active: {
      true: {
        color: '$blue500',
        borderBottomColor: '$blue500',
      },
    },
  },
});

const CreateProjectPage = () => {
  const authStatus = useSelector(selectUserAuthStatus);
  const user = useSelector(selectUserUsername);
  const isSuperUser = useSelector(selectUserIsSuperUser);
  const signedIn = authStatus === 'authenticated' && user;
  const [activeTab, setActiveTab] = useState('create');

  if (!signedIn) {
    return (
      <Page>
        <LoginForm />
      </Page>
    );
  }

  return (
    <Page>
      {isSuperUser ? (
        <PageWrapper>
          <TabBar>
            <Tab active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
              Create Project
            </Tab>
            <Tab active={activeTab === 'edit'} onClick={() => setActiveTab('edit')}>
              Edit Project
            </Tab>
          </TabBar>
          {activeTab === 'create' ? <CreateProjectForm /> : <EditProjectForm />}
        </PageWrapper>
      ) : (
        <NotFound />
      )}
      <SuccessToast />
      <ErrorToast />
    </Page>
  );
};

export default CreateProjectPage;
