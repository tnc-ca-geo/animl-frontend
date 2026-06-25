import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useResizeObserver } from '../../app/utils';
import { styled } from '../../theme/stitches.config';
import { selectIsDrawingBbox } from './loupeSlice';
import { selectGlobalBreakpoint } from '../projects/projectsSlice';
import { globalBreakpoints } from '../../config';
import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import DrawBboxOverlay from './DrawBboxOverlay';
import ZoomControls from './ZoomControls';
import { contain } from 'intrinsic-scale';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ZOOM_EPSILON = 0.01;
const MIN_SCALE = 1;
const MAX_SCALE = 8;

const FullImage = styled(Image, {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const ImageContainer = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

const ImageFrame = styled('div', {
  position: 'absolute',
});

// Fill the parent container so the existing intrinsic-scale layout math
// keeps working unchanged inside the TransformComponent.
const transformWrapperStyle = { width: '100%', height: '100%' };
const transformContentStyle = { width: '100%', height: '100%', position: 'relative' };

const FullSizeImage = forwardRef(function FullSizeImage(
  { workingImages, image, focusIndex, bboxesVisible = true, onZoomChange },
  ref,
) {
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  // track image loading state
  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [image._id]);
  const handleImgLoaded = () => setImgLoaded(true);

  // track actual, rendered image dimensions. This is necessary because we're
  // using the `object-fit: contain` css property on the <img/> tag itself
  // to handle both horizontal and vertical auto-resizing, and use-resize-observer
  // tracks the image's parent container's dims rather than the resized image's
  // https://github.com/ZeeCoder/use-resize-observer/issues/106
  const imgEl = useRef(null);
  const imgContainerDims = useResizeObserver(imgEl);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0, x: 0, y: 0 });
  useEffect(() => {
    if (imgLoaded) {
      const src = { width: imgEl.current.naturalWidth, height: imgEl.current.naturalHeight };
      const dest = { width: imgContainerDims.width, height: imgContainerDims.height };
      let containedImgDims = contain(dest.width, dest.height, src.width, src.height);
      setImgDims(containedImgDims);
    }
  }, [imgLoaded, imgContainerDims.width, imgContainerDims.height]);

  // build array of objects to render
  const currImgObjects = workingImages[focusIndex.image].objects;
  const [tempObject, setTempObject] = useState(null);
  let objectsToRender = currImgObjects.filter((obj) =>
    obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
  );
  if (tempObject) objectsToRender.push(tempObject);

  // if obejctsToRender contains any empties, order them first
  // so that they get rendered below the smaller bboxes,
  // making them easier to select
  const emptyObjIndices = objectsToRender.reduce((acc, curr, i) => {
    if (curr.labels.some((lbl) => lbl.category === 'empty')) acc.push(i);
    return acc;
  }, []);
  emptyObjIndices.forEach((i) => {
    const object = objectsToRender[i];
    objectsToRender.splice(i, 1);
    objectsToRender.unshift(object);
  });

  // --- Zoom/pan state ---
  const transformRef = useRef(null);
  const [scale, setScale] = useState(1);
  const isZoomed = !isSmallScreen && scale > 1 + ZOOM_EPSILON;
  const handleTransform = useCallback((_ctxRef, state) => {
    setScale(state.scale);
  }, []);
  useEffect(() => {
    onZoomChange?.(isZoomed);
  }, [isZoomed, onZoomChange]);

  // --- HD original-image upgrade ---
  const originalUrl = image.url?.original;
  const [useHighRes, setUseHighRes] = useState(false);
  const [highResReady, setHighResReady] = useState(false);
  const wantsHighRes = useHighRes || isZoomed;
  useEffect(() => {
    if (!wantsHighRes || !originalUrl || highResReady) return;
    const preload = new window.Image();
    preload.onload = () => setHighResReady(true);
    preload.src = originalUrl;
    return () => {
      preload.onload = null;
    };
  }, [wantsHighRes, originalUrl, highResReady]);

  // Reset zoom + HD state whenever the image changes
  useEffect(() => {
    transformRef.current?.resetTransform(0);
    setScale(1);
    setUseHighRes(false);
    setHighResReady(false);
  }, [image._id]);

  const effectiveSrc = wantsHighRes && originalUrl && highResReady ? originalUrl : image.url.medium;

  // Imperative zoom API used by Loupe for +/-/0 hotkeys
  useImperativeHandle(ref, () => ({
    zoomIn: () => transformRef.current?.zoomIn(),
    zoomOut: () => transformRef.current?.zoomOut(),
    resetZoom: () => transformRef.current?.resetTransform(),
  }));

  return (
    <ImageContainer className="image-container">
      <TransformWrapper
        ref={transformRef}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        initialScale={1}
        centerOnInit
        disabled={isSmallScreen}
        wheel={{ step: 0.15 }}
        doubleClick={{ step: 1.5, mode: 'toggle', disabled: isDrawingBbox }}
        panning={{ disabled: !isZoomed }}
        onTransform={handleTransform}
      >
        <TransformComponent
          wrapperStyle={transformWrapperStyle}
          contentStyle={transformContentStyle}
        >
          {imgLoaded && (
            <ImageFrame
              className="image-frame"
              css={{
                left: imgDims.x,
                top: imgDims.y,
                width: imgDims.width,
                height: imgDims.height,
              }}
            >
              {bboxesVisible &&
                objectsToRender &&
                objectsToRender.map((obj) => {
                  return (
                    <BoundingBox
                      key={obj._id}
                      imgId={image._id}
                      imgDims={imgDims}
                      object={obj}
                      objectIndex={!obj.isTemp ? currImgObjects.indexOf(obj) : null}
                      focusIndex={focusIndex}
                      setTempObject={setTempObject}
                      awaitingPrediction={image.awaitingPrediction}
                      isZoomed={isZoomed}
                    />
                  );
                })}
              {bboxesVisible && isDrawingBbox && !isZoomed && (
                <DrawBboxOverlay
                  imgContainerDims={imgContainerDims}
                  imgDims={imgDims}
                  setTempObject={setTempObject}
                />
              )}
            </ImageFrame>
          )}
          <FullImage ref={imgEl} src={effectiveSrc} onLoad={handleImgLoaded} />
        </TransformComponent>
        {!isSmallScreen && (
          <ZoomControls
            scale={scale}
            useHighRes={useHighRes}
            highResReady={highResReady}
            setUseHighRes={setUseHighRes}
            hasOriginal={!!originalUrl}
          />
        )}
      </TransformWrapper>
    </ImageContainer>
  );
});

export default FullSizeImage;
