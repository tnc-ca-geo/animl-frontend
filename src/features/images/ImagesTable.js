import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  sortChanged,
  // visibleRowsChanged,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import { setFocus, selectFocusIndex } from '../review/reviewSlice';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice';
import { Image } from '../../components/Image';
import LabelPills from './LabelPills';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


// TODO: make table horizontally scrollable on smaller screens
  // '.tableWrap': {
  //   display: 'block',
  //   margin: '$3',
  //   maxWidth: '100%',
  //   overflowX: 'scroll',
  //   overflowY: 'hidden',
  // },

const TableContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
});

const Table = styled.div({
  height: '100%',
  maxWidth: '100%',
  display: 'inline-block',
  borderSpacing: '$0',
});

const TableRow = styled.div({
  backgroundColor: '$gray200',
  ':hover': {
    backgroundColor: '$gray300',
    cursor: 'pointer',
    boxShadow: '0 0.16rem 0.36rem 0 rgba(0, 0, 0, 0.13), 0 0.03rem 0.09rem 0 rgba(0, 0, 0, 0.11)',
  },
  ':last-child': {
    '.td': {
      borderBottom: '0',
    },
  },

  variants: {
    selected: {
      true: {
        // 'zIndex': '2',
        // 'boxShadow': '0px 4px 14px 0px #0000003b',      
      }
    }
  }
});

const TableCell = styled.div({
  margin: '$0',
  padding: '$2 $3',
  textAlign: 'left',
  // The secret sauce
  // Each cell should grow equally
  width: '1%',
  // But "collapsed" cells should be as small as possible
  '&.collapse': {
    width: '0.0000000001%',
  },
  borderRight: '0',
  ':last-child': {
    borderRight: '0',
  }
});

const HeaderCell = styled(TableCell, {
  backgroundColor: '$gray200',
  ':hover': {
    cursor: 'auto',
  },
});

const DataCell = styled(TableCell, {
  backgroundColor: '$loContrast',
  margin: '0px',
  marginBottom: '2px',
  display: 'flex',
  alignItems: 'center',
  variants: {
    selected: {
      true: {
        // backgroundColor: '$gray300',
      }
    }
  }
});

const TableHeader = styled.div({
  paddingTop: '$2',
  paddingBottom: '$2',
  'svg': {
    marginLeft: '$3',
    'path': {
      fill: '$gray600',
    }
  },
  variants: {
    issorted: {
      true: {
        color: '$hiContrast',
        'svg path': { fill: '$hiContrast' },
      },
      false: {
        color: '$gray600',
        'svg path': { fill: '$gray600' },
      },
    },
  },
});

// TODO: move somewhere else
const scrollbarWidth = () => {
  // thanks too https://davidwalsh.name/detect-scrollbar-width
  const scrollDiv = document.createElement('div');
  scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;');
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
};

const makeRows = (workingImages, focusIndex) => {
  return workingImages.map((image, imageIndex) => {
    const isImageFocused = imageIndex === focusIndex.image;
    const thumbnail = <Image selected={isImageFocused} src={image.thumbUrl} />;
    const labelPills = <LabelPills
      objects={workingImages[imageIndex].objects}
      imageIndex={imageIndex}
      focusIndex={focusIndex}
    />;
    let needsReview = 'Yes'; 
    // TODO: revisit this. If any objects are unlocked on an image,
    // mark as 'needs review'
    // image.labels.forEach((label) => {
    //   if (label.validation.reviewed) {
    //     needsReview = 'No';
    //   }
    // });

    return {
      thumbnail,
      labelPills,
      needsReview,
      ...image,
    }
  })
};

const ImagesTable = ({ workingImages, hasNext, loadNextPage }) => {
  const dispatch = useDispatch();
  const isLoupeOpen = useSelector(selectLoupeOpen)
  const focusIndex = useSelector(selectFocusIndex);
  const paginatedFiled = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const scrollBarSize = useMemo(() => scrollbarWidth(), []);
  // const [ visibleRows, setVisibleRows ] = useState([null, null]);
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const hasMountedRef = useRef(false);
  const imagesCount = hasNext ? workingImages.length + 1 : workingImages.length;
  const isImageLoaded = useCallback((index) => {
    return !hasNext || index < workingImages.length;
  }, [hasNext, workingImages]);

  const data = makeRows(workingImages, focusIndex);

  const defaultColumn = useMemo(() => ({
    minWidth: 30,
    width: 130, // width is used for both the flex-basis and flex-grow
    maxWidth: 400,
  }), []);

  const columns = useMemo(() => [
    {
      Header: '',
      accessor: 'thumbnail',
      disableSortBy: true,
      width: '155',
      disableResizing: true,
    },
    {
      Header: 'Labels',
      accessor: 'labelPills',
      disableSortBy: true,
      width: '275',
    },
    {
      Header: 'Date created',
      accessor: 'dateTimeOriginal',
    },
    {
      Header: 'Date added',
      accessor: 'dateAdded',
    },
    {
      Header: 'Needs review',
      accessor: 'needsReview',
      disableSortBy: true,
    },
    {
      Header: 'Camera',
      accessor: 'cameraSn',
    },
    {
      Header: 'Camera make',
      accessor: 'make',
      disableSortBy: true,
    },
  ], []);

  const columnsToHide = useMemo(() => (
    columns.reduce((acc, curr) => {
      const id = curr.accessor;
      if (id !== 'thumbnail' && id !== 'labelPills') {
        acc.push(id)
      }
      return acc;
    }, [])
  ), [columns]);

  const initialState = {
    sortBy: [
      {
        id: paginatedFiled,
        desc: !sortAscending,
      }
    ],
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setHiddenColumns,
    toggleHideAllColumns,
    state: { sortBy },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      manualSortBy: true,
      disableSortRemove: true,
      initialState,
    },
    useResizeColumns,
    useFlexLayout,
    useSortBy,
  );

  // useEffect(() => {
  //   dispatch(visibleRowsChanged(visibleRows))
  // }, [dispatch, visibleRows]);

  useEffect(() => {
    if (focusIndex.image) {
      // TODO: make auto scrolling smooth:
      // https://github.com/bvaughn/react-window/issues/16
      listRef.current.scrollToItem(focusIndex.image, 'smart');
    }
  }, [focusIndex.image]);

  useEffect(() => {
    // Each time the sortBy changes we call resetloadMoreItemsCache 
    // to clear the infinite list's cache. This effect will run on mount too;
    // there's no need to reset in that case.
    if (hasMountedRef.current) {
      dispatch(sortChanged(sortBy));
      if (infiniteLoaderRef.current) {
        infiniteLoaderRef.current.resetloadMoreItemsCache();
      }
    }
    hasMountedRef.current = true;
  }, [sortBy, dispatch]);

  useEffect(() => {
    if (isLoupeOpen) {
      setHiddenColumns(columnsToHide);
    }
    else {
      toggleHideAllColumns(false)
    }
  }, [isLoupeOpen, columnsToHide]);

  const handleRowClick = useCallback((id) => {
    dispatch(setFocus({ image: Number(id), object: null, label: null }));
    dispatch(toggleOpenLoupe(true));
  }, [dispatch]);

  const RenderRow = useCallback(
    ({ index, style }) => {
      if (isImageLoaded(index)) {
        const row = rows[index];
        prepareRow(row);
        return (
          <TableRow
            {...row.getRowProps({ style })}
            onClick={() => handleRowClick(row.id)}
            selected={focusIndex.image === index}
          >
            {row.cells.map(cell => {
              return (
                <DataCell
                  {...cell.getCellProps()}
                  selected={focusIndex.image === index}
                >
                  {cell.render('Cell')}
                </DataCell>
              )
            })}
          </TableRow>
        );
      }
      else {
        return (
          <TableRow />
        )
      };
    },
    [prepareRow, rows, handleRowClick, isImageLoaded, focusIndex]
  );

  const InfiniteList = useCallback(
    ({ height, width }) => (
      <div {...getTableBodyProps()}>
        <InfiniteLoader
          ref={infiniteLoaderRef}
          items={workingImages}
          isItemLoaded={isImageLoaded}
          itemCount={imagesCount}
          loadMoreItems={loadNextPage}
        >
          {({ onItemsRendered, ref }) => (
            <List
              height={height - 51}
              itemCount={imagesCount}
              itemSize={108}
              onItemsRendered={({
                overscanStartIndex,
                overscanStopIndex,
                visibleStartIndex,
                visibleStopIndex
              }) => {
                // setVisibleRows([visibleStartIndex, visibleStopIndex]);
                onItemsRendered({
                  overscanStartIndex,
                  overscanStopIndex,
                  visibleStartIndex,
                  visibleStopIndex
                });
              }}              
              ref={list => {
                // https://github.com/bvaughn/react-window/issues/324
                ref(list);
                listRef.current = list;
              }}
              width={width}
            >
              { RenderRow }
            </List>
          )}
        </InfiniteLoader>
      </div>
    ),
    [ RenderRow, getTableBodyProps, workingImages, isImageLoaded, imagesCount,
      loadNextPage ]
  );

  return (
    <TableContainer>
      {workingImages.length === 0 &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      {workingImages.length > 0 &&
        <Table {...getTableProps()}>
          <div
            style={{ height: '51px', width: `calc(100% - ${scrollBarSize}px)` }}
          >
            {headerGroups.map(headerGroup => (
              <TableRow
                {...headerGroup.getHeaderGroupProps()}
              >
                {headerGroup.headers.map(column => (
                  <HeaderCell 
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    <TableHeader
                      issorted={column.isSorted.toString()}
                      cansort={column.canSort.toString()}
                    >
                      {column.render('Header')}
                      {column.canSort && 
                        <FontAwesomeIcon icon={column.isSortedDesc 
                            ? ['fas', 'caret-down'] 
                            : ['fas', 'caret-up']
                        }/>
                      }
                    </TableHeader>
                  </HeaderCell>
                ))}
              </TableRow>
            ))}
          </div>
          <AutoSizer>
            { InfiniteList }
          </AutoSizer>
        </Table>
      }
    </TableContainer>
  );  
}

export default ImagesTable;
