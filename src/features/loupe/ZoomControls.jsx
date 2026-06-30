import React from 'react';
import { styled } from '../../theme/stitches.config';
import { useControls } from 'react-zoom-pan-pinch';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from '@radix-ui/react-icons';
import { Hd } from 'lucide-react';
import IconButton from '../../components/IconButton';
import { SimpleSpinner } from '../../components/Spinner';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from '../../components/Tooltip';
import { yellow } from '@radix-ui/colors';

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

const HdButton = styled('div', {
  padding: '0px 2px',
  borderRadius: '$2',
  backgroundColor: yellow.yellow10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ZoomControls = ({
  scale,
  highResRequested,
  highResReady,
  setHighResRequested,
  hasOriginal,
}) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const isZoomed = scale > 1 + ZOOM_EPSILON;
  const isLoadingHighRes = highResRequested && !highResReady;
  const hdActionable = !highResReady && !isLoadingHighRes;

  let hdTooltip;
  if (highResReady) hdTooltip = 'High-resolution image loaded';
  else if (isLoadingHighRes) hdTooltip = 'Loading high-resolution image…';
  else hdTooltip = 'Load high-resolution image';

  return (
    <Container idle={!isZoomed}>
      {hasOriginal && (
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              variant="ghost"
              size="small"
              onClick={hdActionable ? () => setHighResRequested(true) : undefined}
              css={{ cursor: hdActionable ? 'pointer' : 'default' }}
            >
              {isLoadingHighRes ? (
                <SimpleSpinner size="sm" />
              ) : (
                <HdButton css={{ backgroundColor: highResReady ? yellow.yellow10 : 'transparent' }}>
                  <Hd color={highResReady ? '#000' : '#888'} size={18} />
                </HdButton>
              )}
            </IconButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            {hdTooltip}
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            variant="ghost"
            size="small"
            onClick={() => resetTransform()}
            disabled={!isZoomed}
          >
            <ResetIcon width={18} height={18} />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Reset zoom
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton variant="ghost" size="small" onClick={() => zoomOut()} disabled={!isZoomed}>
            <ZoomOutIcon width={18} height={18} />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Zoom out
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton variant="ghost" size="small" onClick={() => zoomIn()}>
            <ZoomInIcon width={18} height={18} />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Zoom in
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </Container>
  );
};

export default ZoomControls;
