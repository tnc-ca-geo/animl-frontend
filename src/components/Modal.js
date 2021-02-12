import React from 'react';
import { styled } from '../theme/stitches.config';
import PanelHeader from './PanelHeader';

const ModalBody = styled.div({
  margin: '$3',
});

const ModalContainer = styled.div({
  zIndex: '$2',
  position: 'fixed',    
  top: '150px',
  left: '50%',
  transform: 'translate(-50%, -100px)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '$2',
  backgroundColor: '$loContrast',
  border: '$1 solid $gray400',
  boxShadow: `rgba(22, 23, 24, 0.35) 0px 10px 38px -10px, 
   rgba(22, 23, 24, 0.2) 0px 10px 20px -15px`,

  variants: {
    size: {
      sm: {
        width: '30%',
        // height: '30%',
      },
      md: {
        width: '50%',
        height: '50%',
      },
      lg: {
        width: '95%',
        height: '95%',
      },
    }
  }
});

const ModalWrapper = styled.div({
  zIndex: '$1',
  position: 'fixed',
  top: '$0',
  left: '$0',
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.1)',
});

const Modal = ({ size, title, handleClose, children }) => (
  <ModalWrapper>
    <ModalContainer size={size}>
      <PanelHeader title={title} handlePanelClose={handleClose} />
      <ModalBody>
        {React.Children.map(
          children,
          (child) => React.cloneElement(child, { handleClose })
        )}
      </ModalBody>
    </ModalContainer>
  </ModalWrapper>
)

export default Modal;