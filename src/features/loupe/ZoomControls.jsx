import React from 'react';
import { styled } from '../../theme/stitches.config';
import { useControls } from 'react-zoom-pan-pinch';
import { ZoomInIcon, ZoomOutIcon, ResetIcon, ImageIcon } from '@radix-ui/react-icons';
import IconButton from '../../components/IconButton';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from '../../components/Tooltip';

const ZOOM_EPSILON = 0.01;

const Container = styled('div', {
  position: 'absolute',
  bottom: '$3',
  right: '$3',
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$1 $2',
  borderRadius: '$3',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: 'opacity 120ms ease',
  variants: {
    idle: {
      true: { opacity: 0.55, '&:hover': { opacity: 1 } },
      false: { opacity: 1 },
    },
  },
});

const ScaleBadge = styled('span', {
  fontFamily: '$mono',
  fontSize: '$1',
  color: '$gray11',
  minWidth: '36px',
  textAlign: 'right',
  userSelect: 'none',
});

const HdBadge = styled('span', {
  fontFamily: '$mono',
  fontSize: '10px',
  fontWeight: '$5',
  letterSpacing: '0.5px',
  padding: '1px 4px',
  borderRadius: '$1',
  backgroundColor: '$blue4',
  color: '$blue11',
  userSelect: 'none',
});

const ZoomControls = ({ scale, useHighRes, highResReady, setUseHighRes, hasOriginal }) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const isZoomed = scale > 1 + ZOOM_EPSILON;
  const showHdBadge = hasOriginal && (useHighRes || isZoomed) && highResReady;

  return (
    <Container idle={!isZoomed}>
      {isZoomed && <ScaleBadge>{Math.round(scale * 100)}%</ScaleBadge>}

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton variant="ghost" size="small" onClick={() => zoomOut()} disabled={!isZoomed}>
            <ZoomOutIcon />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Zoom out (-)
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton variant="ghost" size="small" onClick={() => zoomIn()}>
            <ZoomInIcon />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Zoom in (+)
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            variant="ghost"
            size="small"
            onClick={() => resetTransform()}
            disabled={!isZoomed}
          >
            <ResetIcon />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Reset zoom (0)
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      {hasOriginal && (
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => setUseHighRes((v) => !v)}
              state={useHighRes ? 'active' : undefined}
            >
              <ImageIcon />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            {useHighRes ? 'Switch to standard resolution' : 'Load high-resolution image'}
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}

      {showHdBadge && <HdBadge>HD</HdBadge>}
    </Container>
  );
};

export default ZoomControls;
