import React from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { blackA, mauve, violet } from '@radix-ui/colors';
import { styled } from '../theme/stitches.config';

const StyledScrollAreaRoot = styled(ScrollArea.Root, {
  // width: '200px',
  // height: '225px',
  height: '100%',
  // borderRadius: '4px',
  overflow: 'hidden',
  // boxShadow: `0 2px 10px ${blackA.blackA7})`,
  // backgroundColor: '$loContrast',
  '--scrollbar-size': '10px'
});

const StyledScrollAreaViewport = styled(ScrollArea.Viewport, {
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  position: 'absolute'
});

const StyledScrollAreaScrollbar = styled(ScrollArea.Scrollbar, {
  display: 'flex',
  /* ensures no selection */
  userSelect: 'none',
  /* disable browser handling of all panning and zooming gestures on touch devices */
  touchAction: 'none',
  padding: '2px',
  background: blackA.blackA6,
  transition: 'background 160ms ease-out',

  '&:hover': {
    background: blackA.blackA8,
  },

  '&[data-orientation="vertical"]': {
    width: 'var(--scrollbar-size)'
  },
  
  '&[data-orientation="horizontal"]': {
    flexDirection: 'column',
    height: 'var(--scrollbar-size)'
  }
});

const StyledScrollAreaThumb = styled(ScrollArea.Thumb, {
  flex: '1',
  background: mauve.mauve10,
  borderRadius: 'var(--scrollbar-size)',
  position: 'relative',

  /* increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html */
  // '&::before': {
  //   content: '',
  //   position: 'absolute',
  //   top: '50%',
  //   left: '50%',
  //   transform: 'translate(-50%, -50%)',
  //   width: '100%',
  //   height: '100%',
  //   minWidth: '44px',
  //   minHeight: '44px'
  // }
});

const StyledScrollAreaCorner = styled(ScrollArea.Corner, {
  background: blackA.blackA8,
});

// .Text {
//   color: var(--violet-11);
//   font-size: 15px;
//   line-height: 18px;
//   font-weight: 500;
// }

// .Tag {
//   color: var(--mauve-12);
//   font-size: 13px;
//   line-height: 18px;
//   margin-top: 10px;
//   border-top: 1px solid var(--mauve-6);
//   padding-top: 10px;
// }



const StyledScrollArea = ({ children }) => (
  <StyledScrollAreaRoot>
    <StyledScrollAreaViewport>
      {children}
    </StyledScrollAreaViewport>
    <StyledScrollAreaScrollbar orientation='vertical'>
      <StyledScrollAreaThumb />
    </StyledScrollAreaScrollbar>
    <StyledScrollAreaScrollbar orientation="horizontal">
      <StyledScrollAreaThumb />
    </StyledScrollAreaScrollbar>
    <StyledScrollAreaCorner />
  </StyledScrollAreaRoot>
);

export default StyledScrollArea;
