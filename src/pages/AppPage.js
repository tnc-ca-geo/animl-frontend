import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../theme/stitches.config.js';
import { selectUserUsername, selectUserAuthState } from '../features/user/userSlice.js';
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState } from '@aws-amplify/ui-components';
import { Page } from '../components/Page';
import ViewExplorer from '../features/projects/ViewExplorer';

const LoginScreen = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});


const AppPage = () => {
  const authState = useSelector(selectUserAuthState);
  const user = useSelector(selectUserUsername);
  const signedIn = authState === AuthState.SignedIn && user;
  
  return (
    <Page>
      {signedIn
        ? (<ViewExplorer />)
        : (<LoginScreen>
            <AmplifyAuthenticator hideDefault={true}/>
          </LoginScreen>)
      }
    </Page>
  );
};

export default AppPage;
