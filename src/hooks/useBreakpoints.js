import useResizeObserver from 'use-resize-observer';
import { useState, useCallback } from 'react';

const useBreakpoints = (breakpoints) => {
  const [breakpoint, setBreakpoint] = useState(undefined);
  const { ref } = useResizeObserver({
    onResize: useCallback(
      ({ width }) => {
        for (let i = 0; i < breakpoints.length; i++) {
          if (width <= breakpoints[i][1]) {
            setBreakpoint(breakpoints[i][0]);
            break;
          }
        }
      },
      [breakpoints],
    ),
  });

  return { ref, breakpoint };
};

export default useBreakpoints;
