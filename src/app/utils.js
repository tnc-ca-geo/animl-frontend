import { useState, useEffect, useRef } from 'react';

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

// Hook for watching resize events
export const useResizeObserver = (ref) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    // if (dimensions.width && dimensions.height) return
    const element = ref.current;

    const resizeObserver = new ResizeObserver(entries => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;
      const entry = entries[0];
      if (width !== entry.contentRect.width) setWidth(entry.contentRect.width);
      if (height !== entry.contentRect.height) setHeight(entry.contentRect.height);
      if (top !== entry.contentRect.top) setTop(entry.contentRect.top);
      if (left !== entry.contentRect.left) setLeft(entry.contentRect.left);
    })
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect(element);
  }, [])

  return { width, height, top, left };
}