import React from 'react';
import { styled } from '../theme/stitches.config';
import { Box } from '../components/Box';
import screenshot from '../assets/animl-screenshot.png';
import { violet } from '@radix-ui/colors';
import { Grid } from '../components/Grid';
import { Container } from '../components/Container';
import { MagicWandIcon, LapTimerIcon, BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { MoveRight } from 'lucide-react';

const Gradient = styled(Box, {
  width: '100vw',
  minWidth: '1500px',
  left: '50%',
  transform: 'translateX(-50%)',
  position: 'absolute',
  top: '0px',
  bottom: '0px',
  backgroundRepeat: 'no-repeat',
  backgroundImage:
    'radial-gradient(circle at 15% 50%, #ede9fe, rgba(255, 255, 255, 0) 25%), radial-gradient(circle at 85% 30%, #d8f3f6, rgba(255, 255, 255, 0) 25%)',
  '---transparent': '#FDFCFD00',
});

const Background = styled(Box, {
  position: 'absolute',
  inset: '0px',
  backgroundColor: '$loContrast',
  zIndex: -1,
  overflow: 'hidden',
});

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
  a: {
    textDecoration: 'none',
    color: '$textDark',
  },
});

const CTA = styled(Button, {
  marginTop: '$5',
  borderRadius: '$4',
  paddingLeft: '$5',
  paddingRight: '$5',
  height: '$6',
  fontSize: '$3',
  fontWeight: '$4',
  svg: {
    marginRight: '0px',
  },
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$loContrast',
    cursor: 'pointer',
  },
  '&:hover svg': {
    transform: 'translateX(4px)',
    transition: 'transform 0.2s ease-in-out',
  },
});

const Screenshot = styled('div', {
  width: '90%',
  margin: '$1 auto',
  img: {
    maxWidth: '100%',
    borderRadius: '$2',
    boxShadow:
      '0px 60px 123px -25px hsla(208, 29%, 12%, 0.42), 0px 35px 75px -35px hsla(208, 24%, 10%, 0.08)',
  },
});

const Hero = styled('div', {
  textAlign: 'center',
  paddingTop: '$8',
  paddingBottom: '$8',
});

const Feature = styled('div', {});

const FeatureIcon = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  backgroundColor: violet.violet5,
  color: violet.violet10,
  marginBottom: '$3',
  svg: {
    width: 25,
    height: 25,
  },
});

const FeatureHeading = styled('div', {
  fontSize: '$5',
  fontWeight: '$4',
  marginBottom: '$2',
  color: '$textDark',
});

const FeatureText = styled('div', {
  fontSize: '$4',
  fontWeight: '$2',
  color: '$textMedium',
});

const AppPage = () => {
  return (
    <Box>
      <Background>
        <Gradient />
      </Background>
      <Hero>
        <Header css={{ '@bp3': { fontSize: '64px' } }}>Tame your wildlife data</Header>
        <Subheader>
          Animl is an open-source, cloud-based platform for managing camera trap data, built and
          used by{' '}
          <a href="https://nature.org" target="_blank" rel="noreferrer">
            The Nature Conservancy
          </a>
        </Subheader>
        <CTA
          as="a"
          target="_blank"
          rel="noreferrer"
          href="https://forms.office.com/pages/responsepage.aspx?id=wW2-eY7Xu0uyK9mUwKQXpwzCMkfW3t1Lik2xYkZp01pUNTEyM0c5NFpaNlhJWUgwVEdJTk9VUVdTRS4u"
        >
          <p style={{ marginRight: '10px' }}> Sign up </p> <MoveRight size="16" />
        </CTA>
      </Hero>
      <Screenshot css={{ '@bp1': { width: '80%', margin: '$5 auto' } }}>
        <img src={screenshot} alt="animl user interface screenshot" />
      </Screenshot>
      <Container size="3">
        <Grid
          css={{
            gap: '$6',
            gridTemplateColumns: '1fr',
            '@bp1': {
              gap: '$7',
              gridTemplateColumns: '1fr 1fr',
            },
            '@bp2': {
              gap: '$7',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
            },
            marginTop: '$10',
            marginBottom: '$10',
          }}
        >
          <Feature>
            <FeatureIcon>
              <LapTimerIcon />
            </FeatureIcon>
            <FeatureHeading>Real-time data</FeatureHeading>
            <FeatureText>
              Ingest and process images in real-time from wireless and cellular camera traps.
            </FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>
              <MagicWandIcon />
            </FeatureIcon>
            <FeatureHeading>Object detection</FeatureHeading>
            <FeatureText>
              Configure custom machine learning pipelines to automatically predict what’s in the
              images – and weed out empty images if nothing is detected.
            </FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>
              <MagnifyingGlassIcon />
            </FeatureIcon>
            <FeatureHeading>Advanced querying</FeatureHeading>
            <FeatureText>
              Filter, analyze, and export data using advanced querying capabilities.
            </FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>
              <BellIcon />
            </FeatureIcon>
            <FeatureHeading>Alerts</FeatureHeading>
            <FeatureText>
              Configure automated alerts to notify users if a species of concern is detected.
            </FeatureText>
          </Feature>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default AppPage;
