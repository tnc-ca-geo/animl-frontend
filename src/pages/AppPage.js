import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../theme/stitches.config.js';
import { selectUserUsername, selectUserAuthStatus } from '../features/user/userSlice.js';
import { Authenticator } from "@aws-amplify/ui-react";
import { Page } from '../components/Page';
import ViewExplorer from '../features/projects/ViewExplorer';
import '@aws-amplify/ui-react/styles.css';

const LoginScreen = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '$backgroundLight',
});

const AppPage = () => {
  const authStatus = useSelector(selectUserAuthStatus);
  const user = useSelector(selectUserUsername);
  const signedIn = authStatus === 'authenticated' && user;

  return (
    <Page>
      {signedIn
        ? (<ViewExplorer />)
        : (<LoginScreen>
            <Authenticator
              loginMechanisms={['email']}
              hideDefault={true}
              hideSignUp={true}
            />
          </LoginScreen>)
      }
    </Page>
  );
};

export default AppPage;
