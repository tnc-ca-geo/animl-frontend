
import { styled } from '../theme/stitches.config.js';
import logo from '../assets/tnc-logo-black.svg';
import { Container } from './Container.jsx';

const StyledFooter = styled(Container, {
  textAlign: 'center',
  fontSize: '$4',
  fontWeight: '$2',
  color:'$textLight',
})

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    
    <StyledFooter size="3">
      <a href="https://www.nature.org/" target="_blank" rel="noreferrer">
        <img
          alt='The Nature Conservancy'
          src={logo}
          width='126'
        />
      </a>
      <div>
        <p>
          Questions? Feedback? Interested in using Animl for your camera trapping projects? <a href='mailto:nathaniel.rindlaub@TNC.ORG?subject=Animl inquiry'>Contact us</a>
        </p>
      </div>
        <p>© Copyright {year} The Nature Conservancy</p>
        <a
          href='https://www.nature.org/en-us/about-us/who-we-are/accountability/privacy-policy/'
          target='_blank' rel='noopener noreferrer'>
          Privacy Policy
        </a> 
    </StyledFooter>
  );
};

export default Footer;
