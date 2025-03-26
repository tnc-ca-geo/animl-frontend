import React, { useRef, useState, useCallback, useEffect } from 'react';
import { styled } from '../../theme/stitches.config.js';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeGrid } from 'react-window';
import { Image } from '../../components/Image.jsx';
import { Grid3x3, Grid2x2, Square, Filter  } from 'lucide-react';
import { violet } from '@radix-ui/colors';
import FullSizeImage from '../loupe/FullSizeImage.jsx';
// import { useDispatch, useSelector } from 'react-redux';
// import { selectFocusIndex } from '../review/reviewSlice.js';
import FiltersPanel from '../filters/FiltersPanel.jsx';

const colCounts = {
  single: 1,
  middle: 3,
  most: 5
}

const heightModifier = 0.65

const FloatingToolbarContainer = styled('div', {
  position: 'fixed',
  width: '80vw',
  top: '90dvh',
  display: 'flex',
  justifyContent: 'space-around',
  background: '$backgroundLight',
  borderRadius: '1000000px',
  margin: '0 auto',
  left: '50%',
  transform: 'translateX(-50%)',
  overflow: 'hidden',
})

const FloatingToolbarItem = styled('div', {
  display: 'grid',
  placeItems: 'center',
  variants: {
    active: {
      true: {
        backgroundColor: violet.violet5,
        color: violet.violet11,
      }
    }
  },
  padding: '$1',
  flex: '1',
})

const FloatingToolbar = ({
  colCount,
  setColCount,
  openFiltersPanel,
}) => {
  return (
    <FloatingToolbarContainer>
      <FloatingToolbarItem
        onClick={() => openFiltersPanel()}
      >
        <Filter/>
      </FloatingToolbarItem>
      <FloatingToolbarItem
        onClick={() => setColCount(colCounts.most)}
        active={colCount === colCounts.most}
      >
        <Grid3x3/>
      </FloatingToolbarItem>
      <FloatingToolbarItem
        onClick={() => setColCount(colCounts.middle)}
        active={colCount === colCounts.middle}
      >
        <Grid2x2/>
      </FloatingToolbarItem>
      <FloatingToolbarItem
        onClick={() => setColCount(colCounts.single)}
        active={colCount === colCounts.single}
      >
        <Square/>
      </FloatingToolbarItem>
    </FloatingToolbarContainer>
  )
}

const ImageWrapper = styled(Image, {
  maxWidth: '100%',
  width: '100%',
  objectFit: 'contain',
  background: 'Black',
})

const GridImage = ({ uniqueId, imgUrl, onClickImage, style }) => {
  return (
    <ImageWrapper
      key={uniqueId}
      onClick={() => onClickImage()}
      src={imgUrl}
      style={style}
    />
  )
}

const FullSizedImageWrapper = styled('div', {
  backgroundColor: 'Black'
});

export const ImagesGrid = ({ workingImages, hasNext, loadNextPage }) => {
  // const dispatch = useDispatch();
  // const focusIndex = useSelector(selectFocusIndex);
  const gridRef = useRef(null)
  const infiniteLoaderRef = useRef(null)
  const [colCount, setColCount] = useState(colCounts.most)
  const [viewWidth, setViewWidth] = useState(0)
  const [visibleStartStop, setVisibleStartStop] = useState({ rowStart: 0, rowStop: 0 })
  const [scrollTo, setScrollTo] = useState({ row: 0, col: 0 })
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false)

  const onClickImage = (index) => {
    setColCount(colCounts.single)
    setScrollTo({ row: index, col: 0 })
  }

  // TODO
  // For some reason, scroll to center acts weird
  // at the beginning of the grid
  // calculations are right but the scroll to puts
  // the items in a weird spot
  const changeColCount = (newColCount) => {
    if (colCount === newColCount) {
      return
    }

    const { rowStart, rowStop } = visibleStartStop
    const halfway = Math.floor((rowStop - rowStart) / 2)
    // Current middle column
    const col = Math.floor(
      (colCount === colCounts.most 
        ? colCounts.most 
        : colCounts.middle 
          ? colCounts.middle
          : colCounts.single
      ) / 2
    )
    // Find the middle element
    const targetIndex = ((rowStart+halfway)*colCount)+col
    let newRow = Math.floor(targetIndex/newColCount)
    const newCol = Math.floor(
      (newColCount === colCounts.most
        ? colCounts.most
        : colCounts.middle
          ? colCounts.middle
          : colCounts.single
      ) / 2
    )

    // Clamp to the last visible row or 0th row
    if (newRow > (count / newColCount)) {
      newRow = Math.floor(count / newColCount)
    }
    if (newRow < 0) {
      newRow = 0
    }

    setColCount(newColCount)
    setScrollTo({ row: newRow, col: newCol })
  }

  const count = hasNext ? workingImages.length + 1 : workingImages.length
  const isImageLoaded = useCallback(
    (index) => {
      return index < workingImages.length;
    },
    [hasNext, workingImages, colCount],
  );

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const idx = (rowIndex * colCount) + columnIndex
    if (!isImageLoaded(idx)) {
      return (<></>)
    }

    const img = workingImages[idx]
    const uniqueRowId = `${idx}-${img._id}`
    const clickImage = () => onClickImage(idx)
    if (colCount === colCounts.single) {
      return (
        <FullSizedImageWrapper style={style}>
          <FullSizeImage
            workingImages={workingImages}
            image={img}
            focusIndex={{ image: idx }}
            css={{ height: '100%', width: '100%', objectFit: 'contain' }}
          />
        </FullSizedImageWrapper>
      )
    } else {
      return (
        // <div key={uniqueRowId} style={style}>{idx} ({rowIndex}/{columnIndex})</div>
        <GridImage
          uniqueId={uniqueRowId}
          imgUrl={colCount === colCounts.single ? img.url : img.thumbUrl}
          onClickImage={clickImage}
          style={style}
        />
      )
    }
  }, [workingImages, isImageLoaded])
  
  const getRowHeight = useCallback((rowIndex, defaultWidth) => {
    const start = rowIndex * colCount;
    const end = start + colCount;

    let tallest = 0;
    for (let i = 0; i < end; i++) {
      const h = workingImages[i]?.imageHeight ?? (defaultWidth*heightModifier);
      const w = workingImages[i]?.imageWidth ?? defaultWidth;
      const scalingFactor = defaultWidth / w;
      const scaledHeight = h * scalingFactor;
      if (scaledHeight > tallest) {
        tallest = scaledHeight;
      }
    }
    return tallest
  }, [workingImages, colCount]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex(0)
      gridRef.current.resetAfterRowIndex(0)
      const { row, col } = scrollTo
      gridRef.current.scrollToItem({
        align: 'center',
        rowIndex: row,
        columnIndex: col
      })
    }
  }, [colCount])

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex(0)
      gridRef.current.resetAfterRowIndex(0)
    }
  }, [viewWidth])

  return (
    <>
      {workingImages.length > 0 &&
      <>
        <AutoSizer>
          {({ height, width }) => {
            setViewWidth(width);
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
                      ref(grid)
                      gridRef.current = grid
                    }}
                    height={(height)}
                    width={width}
                    columnCount={colCount}
                    columnWidth={() => (width/colCount)}
                    rowCount={Math.ceil(count/colCount)}
                    rowHeight={(rowIndex) => {
                      if (colCount === colCounts.single) {
                        return (height * heightModifier)
                      } else {
                        return getRowHeight(rowIndex, (width/colCount));
                      }
                    }}
                    overscanRowCount={
                      colCount === colCounts.most
                        ? 25 
                        : colCounts.middle 
                          ? 15 : 10 
                    }
                    onItemsRendered={(props) => {
                      setVisibleStartStop({ rowStart: props.visibleRowStartIndex, rowStop: props.visibleRowStopIndex })
                      return onItemsRendered({
                        overscanStartIndex: props.overscanRowStartIndex * colCount + props.overscanColumnStartIndex,
                        overscanStopIndex: props.overscanRowStopIndex * colCount + props.overscanColumnStopIndex,
                        visibleStartIndex: props.visibleRowStartIndex * colCount + props.visibleColumnStartIndex,
                        visibleStopIndex: props.visibleRowStopIndex * colCount + props.visibleColumnStopIndex
                      })
                    }}
                  >
                    {Cell}
                  </VariableSizeGrid>
                )}
              </InfiniteLoader>
          )}}
        </AutoSizer>
        { isFiltersPanelOpen &&
          <FiltersPanel toggleFiltersPanel={setIsFiltersPanelOpen}/>
        }
        { !isFiltersPanelOpen &&
          <FloatingToolbar
            colCount={colCount}
            setColCount={changeColCount}
            openFiltersPanel={() => setIsFiltersPanelOpen(true)}
          />
        }
      </>
    }
    </>
  )
}
