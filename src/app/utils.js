import { useState, useEffect, useRef } from 'react';
import { ResizeObserver } from '@juggle/resize-observer';

/*
 * Hook for skiping the useEffect run on a component's initial render
 * From: https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render
 */
export function useEffectAfterMount(fn, inputs) {
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) {
      return fn();
    } else {
      didMountRef.current = true;
    }
  }, inputs);
}

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
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;
      const entry = entries[0];
      if (width !== entry.contentRect.width) {
        setWidth(entry.contentRect.width);
      }
      if (height !== entry.contentRect.height) {
        setHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect(element);
  }, [ref, height, width]);

  // NOTE: Resize Observer entry's contentRect top/x left/y don't behave the
  // same as getBoundingClientRect() (they're always 0),
  // so use getBoundingClientRect() instead
  useEffect(() => {
    const element = ref.current;
    const container = element.getBoundingClientRect();
    if (top !== container.top) setTop(container.top);
    if (left !== container.left) setLeft(container.left);
  }, [left, ref, top, width]);

  return { width, height, top, left };
};

/*
 * find an image objects from array of images
 */
export const findImage = (images, imgId) => images.find((img) => img._id === imgId);

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
export const truncateString = (str, n) => (str.length > n ? `${str.substring(0, n)}...` : str);

/*
 * convert bbox in absolute vals ([left, top, width, height])
 * to relative values ([ymin, xmin, ymax, xmax])
 */
export const absToRel = (rect, imgDims) => {
  const { left, top, width, height } = rect;
  const ymin = Math.round(top) / imgDims.height;
  const xmin = Math.round(left) / imgDims.width;
  const ymax = (Math.round(top) + Math.round(height)) / imgDims.height;
  const xmax = (Math.round(left) + Math.round(width)) / imgDims.width;
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

/*
 * check if a DOM element is in the top half of the viewport
 */
export const inViewportTopHalf = (domElement) => {
  const viewportEquator = window.innerHeight / 2;
  const rect = domElement.getBoundingClientRect();
  const elVerticalCenter = rect.top + rect.height / 2;
  return elVerticalCenter < viewportEquator;
};

/*
 * returns a text color with high contrast relative to a given background color
 */
export const getTextColor = (bgColor) => {
  if (!bgColor) {
    return '$textDark';
  }

  const threshold = 0.6;
  const [red, green, blue] = [0, 2, 4].map((i) => parseInt(bgColor.slice(i + 1, i + 3), 16));
  const l = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
  return l < threshold ? '$loContrast' : '$textDark';
};

export const getRandomColor = () => {
  const red = Math.floor(Math.random() * (255 - 0) + 0);
  const green = Math.floor(Math.random() * (255 - 0) + 0);
  const blue = Math.floor(Math.random() * (255 - 0) + 0);

  const integer =
    ((Math.round(red) & 0xff) << 16) +
    ((Math.round(green) & 0xff) << 8) +
    (Math.round(blue) & 0xff);

  const string = integer.toString(16).toUpperCase();
  return '000000'.substring(string.length) + string;
};

/*
 * normalize non-graphql errors
 */
export const normalizeErrors = (error, code) => {
  let errs = error;
  if (!Array.isArray(error)) {
    // if the error is thrown on the client side rather than returned by the API
    // (e.g., we lost internet connection and exhausted upload retries)
    // we need to re-format the error to match GraphQL errors array and error objects
    errs = [{ message: error.message, extensions: { code } }];
  }
  return errs;
};

export const isImageReviewed = (image) => {
  // images are considered reviewed if they:
  // have objects,
  // all objects are locked,
  // AND not all labels of all objects have been invalidated
  const hasObjs = image.objects.length > 0;
  const hasUnlockedObjs = image.objects.some((obj) => obj.locked === false);
  const hasAllInvalidatedLabels = !image.objects.some((obj) =>
    obj.labels.some((lbl) => !lbl.validation || lbl.validation.validated),
  );
  return hasObjs && !hasUnlockedObjs && !hasAllInvalidatedLabels;
};

// Factory to create breakpoints and utility methods
export const createBreakpoints = (breakpointValues) => {
  const compareBreakpoints = (bp1, bp2) => {
    const find = (bpLabel) => breakpointValues.find((bp) => bp[0] === bpLabel);
    const foundBp1 = find(bp1);
    const foundBp2 = find(bp2);

    if (foundBp1 === undefined || foundBp2 === undefined) {
      const validValues = breakpointValues.map((bp) => bp[0]);
      throw new Error(
        `${bp1} or ${bp2} is not a valid global breakpoint label.  Valid breakpoint labels are: ${validValues.join(', ')}.`,
      );
    }

    return foundBp1[1] - foundBp2[1];
  };

  return {
    values: breakpointValues,
    lessThanOrEqual: (bp1, bp2) => compareBreakpoints(bp1, bp2) <= 0,
    greaterThanOrEqual: (bp1, bp2) => compareBreakpoints(bp1, bp2) >= 0,
  };
};

// Shorten words for mobile screens
export const shortenedField = (fieldVal) => {
  if (fieldVal.length <= 8) {
    return fieldVal;
  }
  return `${fieldVal.substring(0, 5)}...`;
};
