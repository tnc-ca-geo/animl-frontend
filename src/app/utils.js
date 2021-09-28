import { useEffect, useRef } from 'react';

// Hook for skiping the useEffect run on a component's initial render
// From: https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render 
export function useEffectAfterMount(fn, inputs) {
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current)
      return fn();
    else
      didMountRef.current = true;
  }, inputs);
};