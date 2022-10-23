import React from 'react';
import { styled } from '../theme/stitches.config';
import { Box } from '../components/Box';
import screenshot from '../assets/animl-screenshot.png';
import { MagicWandIcon, LapTimerIcon, GlobeIcon, BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { violet } from '@radix-ui/colors';
import { Grid } from '../components/Grid';
import { Container } from '../components/Container';
import Footer from '../components/Footer';

const Rings = styled('div', {
  boxSizing: 'border-box',
  position: 'relative',
  boxShadow: 'white 0px 0px 0px 80px, rgb(204, 231, 255) 0px 0px 0px 81px, rgb(245, 250, 255) 0px 0px 0px 160px, rgb(214, 236, 255) 0px 0px 0px 161px, white 0px 0px 0px 240px, rgb(214, 236, 255) 0px 0px 0px 241px, rgb(250, 253, 255) 0px 0px 0px 320px, rgb(224, 241, 255) 0px 0px 0px 321px, white 0px 0px 0px 400px, rgb(224, 241, 255) 0px 0px 0px 401px, rgb(250, 253, 255) 0px 0px 0px 480px, rgb(235, 245, 255) 0px 0px 0px 481px, white 0px 0px 0px 560px, rgb(235, 245, 255) 0px 0px 0px 561px, rgb(250, 253, 255) 0px 0px 0px 640px, rgb(235, 245, 255) 0px 0px 0px 641px, white 0px 0px 0px 720px, rgb(235, 245, 255) 0px 0px 0px 721px',
  borderRadius: '50%',
  zIndex: -1,
  width: '100px',
  height: '100px'
});

const Gradient = styled(Box, {
  width: '100vw',
  minWidth: '1500px',
  left: '50%',
  transform: 'translateX(-50%)',
  position: 'absolute',
  top: '0px',
  bottom: '0px',
  backgroundRepeat: 'no-repeat',
  backgroundImage: 'radial-gradient(circle at 15% 50%, #ede9fe, rgba(255, 255, 255, 0) 25%), radial-gradient(circle at 85% 30%, #d8f3f6, rgba(255, 255, 255, 0) 25%)',
  //backgroundImage: 'radial-gradient(circle 800px at 700px 200px, lightblue, var(---transparent)), radial-gradient(circle 600px at calc(100% - 300px) 300px, lightsalmon, var(---transparent)), radial-gradient(circle 800px at right center, aqua, var(---transparent)), radial-gradient(circle 800px at right bottom, lightsalmon, var(---transparent)), radial-gradient(circle 800px at calc(50% - 600px) calc(100% - 100px), aqua, lightblue, var(---transparent))',
  '---transparent': '#FDFCFD00'
})
// const Background = styled('div', {
//   boxSizing: 'border-box',
//   display: 'flex',
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   '-moz-box-align': 'center',
//   alignItems: 'center',
//   '-moz-box-pack': 'center',
//   justifyContent: 'center',
// });

const Background = styled(Box, {
  position: 'absolute',
  inset: '0px',
  backgroundColor: '$loContrast',
  zIndex: -1,
  overflow: 'hidden'
});

const Header = styled('div', {
  fontSize: '42px',
  fontWeight: '$5',
  fontFamily: '$roboto',
  color: '$hiContrast',
});

const Subheader = styled('div', {
  fontSize: '$5',
  fontWeight: '$2',
  fontFamily: '$roboto',
  color: '$gray600',
  paddingTop: '$3',
  maxWidth: 700,
  margin: '0 auto',
  'a': {
    textDecoration: 'none',
    color: '$hiContrast'
  }
});

const Screenshot = styled('div', {
  width: '90%',
  margin: '$1 auto',
  'img': {
    maxWidth: '100%',
    borderRadius: '$2',
    boxShadow: '0px 60px 123px -25px hsla(208, 29%, 12%, 0.42), 0px 35px 75px -35px hsla(208, 24%, 10%, 0.08)'
  }
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
  'svg': {
    width: 25,
    height: 25,
  }
});

const FeatureHeading = styled('div', {
  fontSize: '$5',
  fontWeight: '$4',
  marginBottom: '$2',
});

const FeatureText = styled('div', {
  fontSize: '$4',
  fontWeight: '$2',
  color: '$gray600',
});


const AppPage = () => {
  return (
    <Box css={{ position: 'relative' }}>
      <Background>
        <Gradient />
      </Background>
      <Hero>
        <Header css={{ '@bp3': { fontSize: '64px' }}}>Tame your wildlife data</Header>
        <Subheader>
        Animl is an open-source, cloud-based platform for managing camera trap data, built and used by <a href="https://nature.org" target="_blank" rel="noreferrer">The Nature Conervancy</a>
        </Subheader>
      </Hero>
      <Screenshot css={{ '@bp1': { width: '80%', margin: '$5 auto' }}}>
        <img src={screenshot} alt='animl user interface screenshot'/>
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
            <FeatureIcon><LapTimerIcon/></FeatureIcon>
            <FeatureHeading>Real-time data</FeatureHeading>
            <FeatureText>Ingest and process images in real-time from wireless and cellular camera traps.</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon><MagicWandIcon/></FeatureIcon>
            <FeatureHeading>Object detection</FeatureHeading>
            <FeatureText>Configure custom machine learning pipelines to automatically predict what’s in the images – and weed out empty images if nothing is detected.</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon><MagnifyingGlassIcon/></FeatureIcon>
            <FeatureHeading>Advanced querying</FeatureHeading>
            <FeatureText>Filter, analyze, and export data using advanced querying capabilities.</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon><BellIcon/></FeatureIcon>
            <FeatureHeading>Alerts</FeatureHeading>
            <FeatureText>Configure automated alerts to notify users if a species of concern is detected.</FeatureText>
          </Feature>
        </Grid>
      </Container>
      <Footer/>
    </Box>
  );
};

export default AppPage;
