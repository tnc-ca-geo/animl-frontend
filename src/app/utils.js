import { useState, useEffect, useRef } from 'react';
import { ResizeObserver } from '@juggle/resize-observer'

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
    const element = ref.current;

    const resizeObserver = new ResizeObserver(entries => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;
      const entry = entries[0];
      if (width !== entry.contentRect.width) {
        setWidth(entry.contentRect.width);
      }
      if (height !== entry.contentRect.height) {
        setHeight(entry.contentRect.height);
      }
    })
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect(element);
  }, []);

  // NOTE: Resize Observer entry's contentRect top/x left/y don't behave the  
  // same as getBoundingClientRect() (they're always 0),
  // so use getBoundingClientRect() instead
  useEffect(() => {  
    const element = ref.current;
    const container = element.getBoundingClientRect();
    if (top !== container.top) setTop(container.top);
    if (left !== container.left) setLeft(container.left);
  }, [width]);

  return { width, height, top, left };
};

// truncate string and add ellipsis
export const truncateString = (str, n) => (
  (str.length > n) ? `${str.substring(0, n)}...` : str
);