import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { Auth } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { indigo } from '@radix-ui/colors';
import Button from '../../components/Button.jsx';
// eslint-disable-next-line import/no-unresolved
import '@aws-amplify/ui-react/styles.css';
import { useSelector } from 'react-redux';
import { selectUserUsername } from './authSlice.js';
import Callout from '../../components/Callout.jsx';

const LoginScreen = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '$backgroundLight',
});

// TODO: pull Header and Subheader out as own components
const Header = styled('div', {
  fontSize: '42px',
  fontWeight: '$5',
  fontFamily: '$roboto',
  color: '$textDark',
});

const Subheader = styled('div', {
  fontSize: '$5',
  fontWeight: '$2',
  fontFamily: '$roboto',
  color: '$textMedium',
  paddingTop: '$3',
  maxWidth: 700,
  margin: '0 auto',
  paddingRight: '$4',
  paddingLeft: '$4',
  a: {
    textDecoration: 'none',
    color: '$textDark',
  },
});

const StyledAuthenticator = styled(Authenticator, {
  '&[data-amplify-authenticator] [data-amplify-router]': {
    backgroundColor: '$backgroundLight',
    boxShadow: 'none',
    border: 'none',
    borderRadius: '$2',
  },

  '.amplify-button--primary': {
    backgroundColor: '$blue500',
    color: '$loContrast',
    fontWeight: '$2',
    '&:hover': {
      backgroundColor: '$blue600',
    },
  },

  '.amplify-button--small': {
    color: '$textDark',
    '&:hover': {
      backgroundColor: indigo.indigo4,
      color: '$blue500',
    },
  },

  '.amplify-button.amplify-field__show-password': {
    color: '$textMedium',
    border: '1px solid',
    borderColor: '$border',
    borderTopRightRadius: '$1',
    borderBottomRightRadius: '$1',
    '&:hover': {
      backgroundColor: indigo.indigo4,
      borderTopColor: 'none',
      borderRightColor: 'none',
      borderBottomColor: 'none',
      color: '$blue500',
    },
    '&:focus': {
      backgroundColor: indigo.indigo4,
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
      color: '$blue500',
    },
    '&[aria-checked="true"]': {
      backgroundColor: indigo.indigo4,
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
      color: '$blue500',
    },
  },

  '&[data-amplify-authenticator] [data-amplify-authenticator-resetpassword]': {
    '.amplify-heading': {
      display: 'none',
    },
  },

  '&[data-amplify-authenticator] [data-amplify-authenticator-confirmresetpassword]': {
    '.amplify-heading': {
      display: 'none',
    },
  },

  '.amplify-input': {
    display: 'inherit',
    width: '100%',
    fontSize: '$3',
    fontFamily: '$sourceSansPro',
    color: '$textMedium',
    padding: '$3',
    boxSizing: 'border-box',
    border: '1px solid',
    borderColor: '$border',
    borderRadius: '$1',
    '&:focus': {
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: '0 0 0 3px $gray3',
      borderColor: '$textDark',
      '&:hover': {
        boxShadow: '0 0 0 3px $blue200',
        borderColor: '$blue500',
      },
    },
  },

  '.amplify-alert--error': {
    backgroundColor: '$errorBg',
    color: '$errorText',
    button: {
      backgroundColor: '$errorBg',
      color: '$errorText',
    },
  },
});

const StyledLoginCallout = styled('div', {
  maxWidth: 700,
  margin: '0 auto',
  paddingRight: '$4',
  paddingLeft: '$4',
});

const StyledButton = styled(Button, {
  fontSize: '$3',
  fontWeight: '$2',
  textTransform: 'none',
  color: '$textDark',
  backgroundColor: '$gray1',
  padding: '$3 $4',
  '&:hover': {
    backgroundColor: '$gray4',
  },
  '&:active': {
    backgroundColor: '$gray5',
  },
});

const LoginForm = () => {
  const { route, toSignIn } = useAuthenticator((context) => [context.route]);
  const userName = useSelector(selectUserUsername);

  const services = {
    async handleSignIn(input) {
      try {
        const { username, password } = input;
        return await Auth.signIn(username, password);
      } catch (error) {
        console.log(error.code);
        throw new Error(
          'Temporary password has expired and must be reset by an Project Manager. For more information see: https://docs.animl.camera/fundamentals/user-management',
        );
      }
    },
  };

  const helperText = {
    confirmResetPassword: 'Reset your password',
    resetPassword: 'Enter your email address to receive a password reset code',
    signIn: 'Please enter your email and password to continue',
  };

  return (
    <LoginScreen>
      <Header css={{ '@bp3': { fontSize: '64px' } }}>Welcome back</Header>
      <Subheader>{helperText[route] || userName || ''}</Subheader>
      <StyledAuthenticator
        services={services}
        loginMechanisms={['email']}
        hideDefault={true}
        hideSignUp={true}
      />
      {route === 'resetPassword' && (
        <StyledLoginCallout>
          <Callout type="info" title="Note about temporary passwords">
            <p>
              If you never logged into Animl and didn{"'"}t reset the temporary password that was
              sent in your invitation email before it expired, we are unable to deliver password
              reset emails via the form above.
            </p>
            <p>
              {' '}
              Instead, you must reach out to one of your Project Managers and have them{' '}
              <a
                href="https://docs.animl.camera/fundamentals/user-management#re-sending-users-temporary-passwords"
                target="_blank"
                rel="noreferrer"
              >
                send you a new temporary password
              </a>
              .
            </p>
          </Callout>
        </StyledLoginCallout>
      )}
      {route === 'confirmResetPassword' && (
        <StyledButton onClick={toSignIn}>Return to Sign In</StyledButton>
      )}
    </LoginScreen>
  );
};

export default LoginForm;
