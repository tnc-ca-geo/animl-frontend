import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useScrollbarSize from 'react-scrollbar-size';
import { useEffectAfterMount } from '../../app/utils';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  sortChanged,
  // visibleRowsChanged,
  selectIsLoading,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import {
  setFocus,
  selectFocusIndex,
  selectFocusChangeType
} from '../review/reviewSlice';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice';
import { Image } from '../../components/Image';
import LabelPills from './LabelPills';
import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';


// TODO: make table horizontally scrollable on smaller screens
  // '.tableWrap': {
  //   display: 'block',
  //   margin: '$3',
  //   maxWidth: '100%',
  //   overflowX: 'scroll',
  //   overflowY: 'hidden',
  // },

const TableContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
});

const Table = styled('div', {
  height: '100%',
  maxWidth: '100%',
  display: 'inline-block',
  borderSpacing: '$0',
  backgroundColor: '$gray200',
});

const TableRow = styled('div', {
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: '$gray200',
    cursor: 'pointer',
    // boxShadow: '0 0.16rem 0.36rem 0 rgba(0, 0, 0, 0.13), 0 0.03rem 0.09rem 0 rgba(0, 0, 0, 0.11)',
  },
  '&:last-child': {
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

const TableCell = styled('div', {
  margin: '$0',
  padding: '$0',
  textAlign: 'left',
  // The secret sauce
  // Each cell should grow equally
  width: '1%',
  // But "collapsed" cells should be as small as possible
  '&.collapse': {
    width: '0.0000000001%',
  },
  borderRight: '0',
  '&:last-child': {
    borderRight: '0',
  },
  '&:first-child': {
    paddingLeft: '$3',
  },
});

const HeaderCell = styled(TableCell, {
  backgroundColor: '$gray200',
  borderBottom: '1px solid $gray400',
  '&:hover': {
    cursor: 'auto',
    color: '$hiContrast',
  },
});

const DataCell = styled(TableCell, {
  margin: '0px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '$3',
  // backgroundColor: '$loContrast',

  borderBottom: '1px solid $gray400',
  // borderTop: '3px solid $gray200',
  // borderBottom: '3px solid $gray200',

  variants: {
    selected: {
      true: {
        backgroundColor: '$gray200',
        // '&:first-child': {
        //   borderLeft: '4px solid $blue500',
        //   paddingLeft: '12px',
        // },
      }
    }
  }
});

const TableHeader = styled('div', {
  paddingTop: '$2',
  paddingBottom: '$2',
  backgroundColor: '$gray200',
  fontSize: '$3',
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
    cansort: {
      true: {
        '&:hover': {
          color: '$hiContrast',
          'svg path': { fill: '$hiContrast' },
        }
      }
    }
  },
});

const makeRows = (workingImages, focusIndex) => {
  return workingImages.map((image, imageIndex) => {
    const isImageFocused = imageIndex === focusIndex.image;
    const thumbnail = <Image selected={isImageFocused} src={image.thumbUrl} />;
    const labelPills = <LabelPills
      objects={workingImages[imageIndex].objects}
      imageIndex={imageIndex}
      focusIndex={focusIndex}
    />;
    const hasUnlockedObj = image.objects.some((obj) => obj.locked === false);
    const needsReview = hasUnlockedObj ? 'Yes' : 'No';

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
  const isLoading = useSelector(selectIsLoading);
  const isLoupeOpen = useSelector(selectLoupeOpen)
  const focusIndex = useSelector(selectFocusIndex);
  const paginatedFiled = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const scrollBarSize = useScrollbarSize();
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
      accessor: 'thumbnail',
      disableSortBy: true,
      width: '155',
      disableResizing: true,
    },
    {
      Header: 'Labels',
      accessor: 'labelPills',
      disableSortBy: true,
      width: '260',
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
      Header: 'Deployment',
      accessor: 'deploymentName',
      disableSortBy: true,
    },
  ], []);

  const columnsToHide = useMemo(() => (
    columns.reduce((acc, curr) => {
      const id = curr.accessor;
      if (id !== 'thumbnail' && 
          id !== 'labelPills') {
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

  const focusChangeType = useSelector(selectFocusChangeType);
  useEffect(() => {
    if (focusIndex.image && focusChangeType === 'auto') {
      // TODO: make auto scrolling smooth:
      // https://github.com/bvaughn/react-window/issues/16
      listRef.current.scrollToItem(focusIndex.image, 'center');
    }
  }, [focusIndex.image, focusChangeType]);

  useEffectAfterMount(() => {
    // Each time the sortBy changes we call resetloadMoreItemsCache 
    // to clear the infinite list's cache. This effect will run on mount too;
    // there's no need to reset in that case.
    dispatch(sortChanged(sortBy));
    if (infiniteLoaderRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
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
    const newIndex = { image: Number(id), object: null, label: null }
    dispatch(setFocus({ index: newIndex, type: 'manual'}));
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
              itemSize={91}
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
      {isLoading &&
        <SpinnerOverlay>
          <CircleSpinner />
        </SpinnerOverlay>
      }
      {workingImages.length > 0 &&
        <Table {...getTableProps()}>
          <div
            style={{ height: '33px', width: `calc(100% - ${scrollBarSize.width}px)` }}
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
