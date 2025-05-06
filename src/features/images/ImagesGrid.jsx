import React, { useRef, useState, useCallback, useEffect } from 'react';
import { styled } from '../../theme/stitches.config.js';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeGrid } from 'react-window';
import { Image } from '../../components/Image.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { selectFocusChangeType, selectFocusIndex } from '../review/reviewSlice.js';
import { useEffectAfterMount } from '../../app/utils.js';
import { sortBy } from 'lodash';
import { selectImagesLoading, sortChanged } from './imagesSlice.js';
import { selectProjectsLoading } from '../projects/projectsSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { RatsNoneFound } from './RatsNoneFound.jsx';
import { FloatingToolbar } from './FloatingToolbar.jsx';
import { SmallScreensLoupe } from '../loupe/SmallScreensLoupe.jsx';
import { selectUserCurrentRoles } from '../auth/authSlice.js';
import { hasRole, WRITE_OBJECTS_ROLES } from '../auth/roles.js';

export const colCounts = {
  single: 1,
  middle: 3,
  most: 5,
};

const heightModifier = 0.65;

const ImageWrapper = styled(Image, {
  maxWidth: '100%',
  width: '100%',
  objectFit: 'contain',
  background: 'Black',
});

const GridImage = ({ uniqueId, imgUrl, onClickImage, style }) => {
  return <ImageWrapper key={uniqueId} onClick={() => onClickImage()} src={imgUrl} style={style} />;
};

export const ImagesGrid = ({ workingImages, hasNext, loadNextPage }) => {
  const dispatch = useDispatch();
  const focusIndex = useSelector(selectFocusIndex);
  const projectsLoading = useSelector(selectProjectsLoading);
  const imagesLoading = useSelector(selectImagesLoading);
  const userRoles = useSelector(selectUserCurrentRoles);

  const hasObjectEditRole = hasRole(userRoles, WRITE_OBJECTS_ROLES);

  const gridRef = useRef(null);
  const infiniteLoaderRef = useRef(null);
  const [colCount, setColCount] = useState(colCounts.single);
  const [visibleStartStop, setVisibleStartStop] = useState({ rowStart: 0, rowStop: 0 });
  const [scrollTo, setScrollTo] = useState({ row: 0, col: 0 });

  const onClickImage = (index) => {
    setColCount(colCounts.single);
    setScrollTo({ row: index, col: 0 });
  };

  useEffectAfterMount(() => {
    dispatch(sortChanged(sortBy));
    if (infiniteLoaderRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
  }, [sortBy, dispatch]);

  // TODO
  // For some reason, scroll to center acts weird
  // at the beginning of the grid
  // calculations are right but the scroll to puts
  // the items in a weird spot
  const changeColCount = (newColCount) => {
    if (colCount === newColCount) {
      return;
    }

    const { rowStart, rowStop } = visibleStartStop;
    const halfway = Math.floor((rowStop - rowStart) / 2);
    // Current middle column
    const col = Math.floor(
      (colCount === colCounts.most
        ? colCounts.most
        : colCounts.middle
          ? colCounts.middle
          : colCounts.single) / 2,
    );
    // Find the middle element
    const targetIndex = (rowStart + halfway) * colCount + col;
    let newRow = Math.floor(targetIndex / newColCount);
    const newCol = Math.floor(
      (newColCount === colCounts.most
        ? colCounts.most
        : colCounts.middle
          ? colCounts.middle
          : colCounts.single) / 2,
    );

    // Clamp to the last visible row or 0th row
    if (newRow > count / newColCount) {
      newRow = Math.floor(count / newColCount);
    }
    if (newRow < 0) {
      newRow = 0;
    }

    setColCount(newColCount);
    setScrollTo({ row: newRow, col: newCol });
  };

  const count = hasNext ? workingImages.length + 1 : workingImages.length;
  const isImageLoaded = useCallback(
    (index) => {
      return index < workingImages.length;
    },
    [hasNext, workingImages, colCount],
  );

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }) => {
      const idx = rowIndex * colCount + columnIndex;
      if (!isImageLoaded(idx)) {
        return <></>;
      }

      const img = workingImages[idx];
      const uniqueRowId = `${idx}-${img._id}`;
      const clickImage = () => onClickImage(idx);
      if (colCount === colCounts.single) {
        return (
          <SmallScreensLoupe 
            key={uniqueRowId}
            style={style}
            idx={idx}
            image={img}
            workingImages={workingImages}
            shouldShowToolbar={hasObjectEditRole}
          />
        );
      } else {
        return (
          // Used for testing zoom in/out
          // <div key={uniqueRowId} style={style}>{idx} ({rowIndex}/{columnIndex})</div>
          <GridImage
            uniqueId={uniqueRowId}
            imgUrl={colCount === colCounts.single ? img.url : img.thumbUrl}
            onClickImage={clickImage}
            style={style}
          />
        );
      }
    },
    [workingImages, isImageLoaded],
  );

  const getRowHeight = useCallback(
    (rowIndex, defaultWidth) => {
      const start = rowIndex * colCount;
      const end = start + colCount;

      let tallest = 0;
      for (let i = 0; i < end; i++) {
        const h = workingImages[i]?.imageHeight ?? defaultWidth * heightModifier;
        const w = workingImages[i]?.imageWidth ?? defaultWidth;
        const scalingFactor = defaultWidth / w;
        const scaledHeight = h * scalingFactor;
        if (scaledHeight > tallest) {
          tallest = scaledHeight;
        }
      }

      if (colCount === colCounts.single) {
        // Image height + toolbar height
        if (hasObjectEditRole) {
          tallest += 145;
        }
      }

      return tallest;
    },
    [workingImages, colCount],
  );

  // Clear grid cache when colCount changes so that
  // it will recalculate the widths
  useEffect(() => {
    onResize();
    if (gridRef.current) {
      const { row, col } = scrollTo;
      gridRef.current.scrollToItem({
        align: 'center',
        rowIndex: row,
        columnIndex: col,
      });
    }
  }, [colCount]);

  const onResize = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex(0);
      gridRef.current.resetAfterRowIndex(0);
    }
  }, [gridRef]);

  const calcColWidth = useCallback(
    (width) => {
      return width / colCount;
    },
    [colCount],
  );

  // Scroll to query params focus image
  const focusChangeType = useSelector(selectFocusChangeType);
  useEffect(() => {
    if (focusIndex.image && focusChangeType === 'auto') {
      setColCount(colCounts.single);
      if (gridRef.current) {
        gridRef.current.scrollToItem({
          align: 'center',
          rowIndex: focusIndex.image,
          columnIndex: 0,
        });
      }
    }
  }, [focusIndex.image, focusChangeType]);

  return (
    <>
      {(projectsLoading.isLoading || imagesLoading.isLoading) && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {imagesLoading.noneFound && <RatsNoneFound />}
      <FloatingToolbar colCount={colCount} setColCount={changeColCount} />
      {workingImages.length > 0 && (
        <>
          <AutoSizer onResize={() => onResize()}>
            {({ height, width }) => {
              return (
                <InfiniteLoader
                  ref={infiniteLoaderRef}
                  isItemLoaded={isImageLoaded}
                  items={workingImages}
                  itemCount={count}
                  loadMoreItems={loadNextPage}
                  threshold={50}
                >
                  {({ onItemsRendered, ref }) => (
                    <VariableSizeGrid
                      ref={(grid) => {
                        ref(grid);
                        gridRef.current = grid;
                      }}
                      height={height}
                      width={width}
                      columnCount={colCount}
                      columnWidth={() => calcColWidth(width)}
                      rowCount={Math.ceil(count / colCount)}
                      rowHeight={(rowIndex) => {
                        return getRowHeight(rowIndex, width / colCount);
                      }}
                      overscanRowCount={
                        colCount === colCounts.most ? 25 : colCounts.middle ? 15 : 10
                      }
                      onItemsRendered={(props) => {
                        setVisibleStartStop({
                          rowStart: props.visibleRowStartIndex,
                          rowStop: props.visibleRowStopIndex,
                        });
                        return onItemsRendered({
                          overscanStartIndex:
                            props.overscanRowStartIndex * colCount + props.overscanColumnStartIndex,
                          overscanStopIndex:
                            props.overscanRowStopIndex * colCount + props.overscanColumnStopIndex,
                          visibleStartIndex:
                            props.visibleRowStartIndex * colCount + props.visibleColumnStartIndex,
                          visibleStopIndex:
                            props.visibleRowStopIndex * colCount + props.visibleColumnStopIndex,
                        });
                      }}
                    >
                      {Cell}
                    </VariableSizeGrid>
                  )}
                </InfiniteLoader>
              );
            }}
          </AutoSizer>
        </>
      )}
    </>
  );
};
