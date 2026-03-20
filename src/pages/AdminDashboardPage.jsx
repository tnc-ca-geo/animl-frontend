import React from 'react';
import { useSelector } from 'react-redux';

import { Page } from '../components/Page.jsx';
import { NotFound } from '../components/NotFound.jsx';
import {
  selectUserUsername,
  selectUserAuthStatus,
  selectUserIsSuperUser,
} from '../features/auth/authSlice.js';
import LoginForm from '../features/auth/LoginForm.jsx';
import AdminDashboard from '../features/admin/AdminDashboard.jsx';

const AdminDashboardPage = () => {
  const authStatus = useSelector(selectUserAuthStatus);
  const user = useSelector(selectUserUsername);
  const isSuperUser = useSelector(selectUserIsSuperUser);
  const signedIn = authStatus === 'authenticated' && user;

  if (!signedIn) {
    return (
      <Page>
        <LoginForm />
      </Page>
    );
  }

  return <Page>{isSuperUser ? <AdminDashboard /> : <NotFound />}</Page>;
};

export default AdminDashboardPage;
