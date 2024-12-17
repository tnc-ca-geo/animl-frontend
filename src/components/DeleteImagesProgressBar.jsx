import React, { useState, useEffect } from 'react';
import * as Progress from '@radix-ui/react-progress';
import { green } from '@radix-ui/colors';
import { styled } from '../theme/stitches.config.js';

const ProgressBar = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'absolute',
  bottom: 0,
  width: '100%',
});

const ProgressRoot = styled(Progress.Root, {
  overflow: 'hidden',
  background: '$backgroundDark',
  // borderRadius: '99999px',
  width: '100%',
  height: '8px',

  /* Fix overflow clipping in Safari */
  /* https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0 */
  transform: 'translateZ(0)',
});

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: green.green9, //sky.sky4, //'$blue600',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});

export const DeleteImagesProgressBar = ({ imageCount }) => {
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(null); // in seconds
  const [elapsedTime, setElapsedTime] = useState(null);

  if (imageCount > 3000) {
    // show progress bar if deleting more than 3000 images (approx wait time will be > 10 seconds)
    setEstimatedTotalTime(imageCount * 0.0055); // estimated deletion time per image in seconds
    setElapsedTime(0);
  }

  useEffect(() => {
    if (estimatedTotalTime) {
      const interval = setInterval(() => {
        setElapsedTime((prevElapsedTime) => {
          if (prevElapsedTime >= estimatedTotalTime) {
            clearInterval(interval);
            setEstimatedTotalTime(null);
            setElapsedTime(null);
            return estimatedTotalTime;
          }
          return prevElapsedTime + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [estimatedTotalTime, elapsedTime]);

  return (
    <ProgressBar css={{ opacity: estimatedTotalTime !== null && elapsedTime !== null ? 1 : 0 }}>
      <ProgressRoot>
        <ProgressIndicator
          css={{
            transform: `translateX(-${100 - (elapsedTime / estimatedTotalTime) * 100}%)`,
          }}
        />
      </ProgressRoot>
    </ProgressBar>
  );
};

// export default DeleteImagesProgressBar;
