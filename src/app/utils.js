import { useState, useEffect, useRef } from 'react';
import { ResizeObserver } from '@juggle/resize-observer'

/*
 * Hook for skiping the useEffect run on a component's initial render
 * From: https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render 
 */
export function useEffectAfterMount(fn, inputs) {
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current)
      return fn();
    else
      didMountRef.current = true;
  }, inputs);
};

/*
 * Hook for watching resize events
 */ 
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


/*
 * find an image objects from array of images
 */ 
export const findImage = (images, imgId) => (
  images.find((img) => img._id === imgId)
);

/*
 * find specific object from array of images
 */ 
export const findObject = (images, imgId, objId) => {
  const image = findImage(images, imgId);
  return image.objects.find((obj) => obj._id === objId);
};

/*
 * find specific object from array of images
 */ 
export const findLabel = (images, imgId, objId, lblId) => {
  const object = findObject(images, imgId, objId);
  return object.labels.find((lbl) => lbl._id === lblId);
};

/*
 * truncate string and add ellipsis
 */ 
export const truncateString = (str, n) => (
  (str.length > n) ? `${str.substring(0, n)}...` : str
);

/*
 * convert bbox in absolute vals ([left, top, width, height])
 * to relative values ([ymin, xmin, ymax, xmax])
 */
export const absToRel = (rect, imageDims) => {
  const { left, top, width, height } = rect;
  const { imageWidth, imageHeight } = imageDims;
  const ymin = Math.round(top) / imageHeight;
  const xmin = Math.round(left) / imageWidth;
  const ymax = (Math.round(top) + Math.round(height)) / imageHeight;
  const xmax = (Math.round(left) + Math.round(width)) / imageWidth;
  return [ymin, xmin, ymax, xmax];
};

/*
 * convert bbox in relative vals ([ymin, xmin, ymax, xmax])
 * to absolute values ([left, top, width, height])
 */
export const relToAbs = (bbox, imageWidth, imageHeight) => {
  const left = bbox[1] * imageWidth;
  const top = bbox[0] * imageHeight;
  const width = (bbox[3] - bbox[1]) * imageWidth;
  const height = (bbox[2] - bbox[0]) * imageHeight;
  return { left, top, width, height };
};
