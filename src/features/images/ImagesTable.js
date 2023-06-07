import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DateTime } from 'luxon';
import { green, orange } from '@radix-ui/colors';
import { CheckIcon, Cross2Icon, TriangleUpIcon, TriangleDownIcon } from '@radix-ui/react-icons'
import useScrollbarSize from 'react-scrollbar-size';
import { useEffectAfterMount } from '../../app/utils';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  sortChanged,
  // visibleRowsChanged,
  selectImagesLoading,
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
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


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
  backgroundColor: '$backgroundDark',
});

const TableRow = styled('div', {
  backgroundColor: '$backgroundLight',
  '&:hover': {
    backgroundColor: '$backgroundMedium',
    cursor: 'pointer',
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
  backgroundColor: '$backgroundDark',
  borderBottom: '1px solid $border',
  '&:hover': {
    cursor: 'auto',
    color: '$textDark',
  },
});

const DataCell = styled(TableCell, {
  margin: '0px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '$3',
  color: '$textDark',
  borderBottom: '1px solid $border',
  variants: {
    selected: {
      true: {
        backgroundColor: '$backgroundDark',
        // '&:first-child': {
        //   borderLeft: '4px solid $blue500',
        //   paddingLeft: '12px',
        // },
      }
    },
    scrollable: {
      true: {
        overflowY: 'scroll',
        alignItems: 'start',
      }
    }
  }
});

const TableHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  paddingTop: '$2',
  paddingBottom: '$2',
  backgroundColor: '$backgroundDark',
  fontSize: '$3',
  'svg': {
    marginLeft: '$2',
    'path': {
      fill: '$gray6',
    }
  },
  variants: {
    issorted: {
      true: {
        color: '$textDark',
        'svg path': { fill: '$textDark' },
      },
      false: {
        color: '$textMedium',
        'svg path': { fill: '$textMedium' },
      },
    },
    cansort: {
      true: {
        '&:hover': {
          color: '$textDark',
          'svg path': { fill: '$textDark' },
        }
      }
    }
  },
});

const NoneFoundAlert = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '$backgroundDark',
  fontWeight: '$3',
  fontSize: '$5',

  '&::after': {
    content: '\\1F400',
    paddingLeft: '$2',
    fontSize: '30px'
  }
});

const StyledReviewIcon = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '$4',
  height: '$4',
  marginLeft: '$3',
  borderRadius: '50%',
  variants: {
    reviewed: {
      true: {
        color: '$successText',
        backgroundColor: '$successBg',
      },
      false: {
        color: '$warnringText',
        backgroundColor: '$warningBg',
      }
    }
  }
});

const ReviewedIcon = ({ reviewed }) => (
  <StyledReviewIcon reviewed={reviewed}>
    {reviewed ? <CheckIcon/> : <Cross2Icon/>}
  </StyledReviewIcon>
);


const ImagesTable = ({ workingImages, hasNext, loadNextPage }) => {
  const dispatch = useDispatch();
  const imagesLoading = useSelector(selectImagesLoading);
  const isLoupeOpen = useSelector(selectLoupeOpen)
  const focusIndex = useSelector(selectFocusIndex);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const scrollBarSize = useScrollbarSize();
  // const [ visibleRows, setVisibleRows ] = useState([null, null]);
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const imagesCount = hasNext ? workingImages.length + 1 : workingImages.length;
  const isImageLoaded = useCallback((index) => {
    return !hasNext || index < workingImages.length;
  }, [hasNext, workingImages]);

  // // listen for shift + mousedown (selecting multiple rows)
  // useEffect(() => {
  //   const handleWindowClick = (e) => {
  //     if (object.isTemp) setTempObject(null);
  //     // unless the last click was on the "edit label" context menu item
  //     if (!targetIsEditLabelMenuItem(e)) { 
  //       dispatch(addLabelEnd());
  //     }
  //   };
  //   addingLabel
  //     ? window.addEventListener('click', handleWindowClick)
  //     : window.removeEventListener('click', handleWindowClick);
  //   return () => window.removeEventListener('click', handleWindowClick);
  // }, [ addingLabel, imgId, object, setTempObject, dispatch ]);

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
      accessor: 'dtOriginal',
    },
    {
      Header: 'Date added',
      accessor: 'dtAdded',
    },
    {
      Header: 'Reviewed',
      accessor: 'reviewed',
      disableSortBy: true,
    },
    {
      Header: 'Camera',
      accessor: 'cameraId',
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
        id: paginatedField,
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
  }, [isLoupeOpen, columnsToHide, setHiddenColumns, toggleHideAllColumns]);

  const handleRowClick = useCallback((e, id) => {
    if (e.shiftKey) {
      console.log('shift + click');
      // TODO: allow for selection of mulitple images to perform bulk actions on
    } else {
      const newIndex = { image: Number(id), object: null, label: null }
      dispatch(setFocus({ index: newIndex, type: 'manual'}));
      dispatch(toggleOpenLoupe(true));
    }
  }, [dispatch]);

  const RenderRow = useCallback(
    ({ index, style }) => {
      if (isImageLoaded(index)) {
        const row = rows[index];
        prepareRow(row);
        return (
          <TableRow
            {...row.getRowProps({ style })}
            onClick={(e) => handleRowClick(e, row.id)}
            selected={focusIndex.image === index}
          >
            {row.cells.map(cell => (
              <DataCell
                {...cell.getCellProps()}
                selected={focusIndex.image === index}
                scrollable={
                  cell.column.Header === 'Labels' && 
                  cell.value.props.objects.length > 4
                }
              >
                {cell.render('Cell')}
              </DataCell>
            ))}
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
              height={height - 33}
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
      {imagesLoading.isLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      {imagesLoading.noneFound && 
        <NoneFoundAlert>
          Rats! We couldn't find any matching images
        </NoneFoundAlert>
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
                        (column.isSortedDesc ? <TriangleDownIcon/> : <TriangleUpIcon/>)
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
};

function makeRows(workingImages, focusIndex) {
  return workingImages.map((img, imageIndex) => {
    // thumbnails
    const isImageFocused = imageIndex === focusIndex.image;
    const thumbnail = <Image selected={isImageFocused} src={img.thumbUrl} />;

    // label pills
    const labelPills = <LabelPills
      objects={workingImages[imageIndex].objects}
      imageIndex={imageIndex}
      focusIndex={focusIndex}
    />;

    // date created
    const dtOriginal = DateTime
      .fromISO(img.dateTimeOriginal)
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

    // date added
    const dtAdded = DateTime
      .fromISO(img.dateAdded)
      .toLocaleString(DateTime.DATE_SHORT);

    // reviewed columns
    const hasObjs = img.objects.length > 0;
    const hasUnlockedObjs = img.objects.some((obj) => obj.locked === false);
    const hasAllInvalidatedLabels = !img.objects.some((obj) => (
      obj.labels.some((lbl) => !lbl.validation || lbl.validation.validated)
    ));
    const reviewed = (hasObjs && !hasUnlockedObjs && !hasAllInvalidatedLabels) 
      ? <ReviewedIcon reviewed={true} /> 
      : <ReviewedIcon reviewed={false} />;

    return {
      thumbnail,
      labelPills,
      dtOriginal,
      dtAdded,
      reviewed,
      ...img,
    }
  })
}

export default ImagesTable;
