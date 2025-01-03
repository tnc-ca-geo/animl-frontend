import React from 'react';
import { styled } from '../theme/stitches.config';
import { Cross2Icon } from '@radix-ui/react-icons';
import IconButton from './IconButton';

const PanelTitle = styled('span', {
  // marginLeft: '$2',
  flex: '1'
});

const ClosePanelButton = styled(IconButton, {
  position: 'absolute',
  margin: '0 $2 0 $2',
  variants: {
    position: {
      left: {
        left: 0,
      },
      right: {
        right: 0,
      }
    }
  }
});

const StyledHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  // justifyContent: 'space-between',
  padding: '$0 $2 $0 $3',
  height: '$7',
  borderTopLeftRadius: '$2',
  borderTopRightRadius: '$2',
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
});

const PanelHeader = (props) => (
  <StyledHeader className={props.className}>
    {props.title &&
      <PanelTitle>
        {props.title}
      </PanelTitle>
    }
    { props.children }
    <ClosePanelButton
      position={props.closeButtonPosition || 'right'}
      variant='ghost'
      onClick={() => props.handlePanelClose()}>
      <Cross2Icon />
    </ClosePanelButton>
  </StyledHeader>
);

export default PanelHeader;
