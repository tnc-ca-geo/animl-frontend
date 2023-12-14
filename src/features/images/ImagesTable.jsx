import React, {
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DateTime } from 'luxon';
import { CheckIcon,
  Cross2Icon,
  TriangleUpIcon,
  TriangleDownIcon,
} from '@radix-ui/react-icons'
import useScrollbarSize from 'react-scrollbar-size';
import { useEffectAfterMount } from '../../app/utils';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import useBreakpoints from '../../hooks/useBreakpoints';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import ImagesTableRow from './ImagesTableRow.jsx';
import {
  sortChanged,
  selectImagesLoading,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import {
  selectFocusIndex,
  selectFocusChangeType,
  selectSelectedImageIndices
} from '../review/reviewSlice';
import { selectLoupeOpen } from '../loupe/loupeSlice';
import { Image } from '../../components/Image';
import LabelPills from './LabelPills';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectProjectsLoading } from '../projects/projectsSlice';
import DeleteImagesAlert from '../loupe/DeleteImagesAlert.jsx';


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
        backgroundColor: '$backgroundExtraDark',
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
        color: '$warningText',
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
  const projectsLoading = useSelector(selectProjectsLoading);
  const imagesLoading = useSelector(selectImagesLoading);
  const isLoupeOpen = useSelector(selectLoupeOpen)
  const focusIndex = useSelector(selectFocusIndex);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const scrollBarSize = useScrollbarSize();
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const imagesCount = hasNext ? workingImages.length + 1 : workingImages.length;
  const isImageLoaded = useCallback((index) => {
    return !hasNext || index < workingImages.length;
  }, [hasNext, workingImages]);
  const selectedImageIndices = useSelector(selectSelectedImageIndices);

  const data = makeRows(workingImages, focusIndex, selectedImageIndices);

  const defaultColumn = useMemo(() => ({ // TODO: move to config
    minWidth: 30,
    width: 100, // width is used for both the flex-basis and flex-grow
    maxWidth: 400,
  }), []);

  const columns = useMemo(() => [ // TODO: move to config
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

  // responsively hide/show table columns
  const { ref, breakpoint } = useBreakpoints([  // TODO: move to config
    ['xxs', 540],
    ['xs', 640],
    ['sm', 740],
    ['md', 840],
    ['lg', 940],
    ['xl', Infinity]
  ]);

  const columnsToHide = useMemo(() => ({  // TODO: move to config
    'loupeOpen': ['dtOriginal', 'dtAdded', 'reviewed', 'cameraId', 'deploymentName'],
    'xxs': ['dtAdded', 'deploymentName', 'cameraId', 'reviewed', 'dtOriginal'],
    'xs': ['dtAdded', 'deploymentName', 'cameraId', 'reviewed'],
    'sm': ['dtAdded', 'deploymentName', 'cameraId'],
    'md': ['dtAdded', 'deploymentName'],
    'lg': ['dtAdded']
  }), []);

  useEffect(() => {
    if (!breakpoint) return;
    if (isLoupeOpen) {
      setHiddenColumns(columnsToHide['loupeOpen']);
    }
    else if (breakpoint === 'xl') {
      toggleHideAllColumns(false)
    }
    else {
      setHiddenColumns(columnsToHide[breakpoint])
    }
  }, [breakpoint, isLoupeOpen, columnsToHide, setHiddenColumns, toggleHideAllColumns]);

  const RenderRow = useCallback(
    ({ index, style }) => {
      if (!isImageLoaded(index)) return (<TableRow />);

      const row = rows[index];
      prepareRow(row);

      return (
        <ImagesTableRow 
          row={row}
          index={index}
          focusIndex={focusIndex}
          style={style}
          selectedImageIndices={selectedImageIndices}
        />
      );
    },
    [prepareRow, rows, isImageLoaded, focusIndex]
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
              onItemsRendered={onItemsRendered}
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
    <TableContainer ref={ref} >
      {(projectsLoading.isLoading || imagesLoading.isLoading) &&
        <SpinnerOverlay>
          <SimpleSpinner/>
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
      <DeleteImagesAlert />
    </TableContainer>
  );  
};

function makeRows(workingImages, focusIndex, selectedImageIndices) {
  return workingImages.map((img, imageIndex) => {
    // thumbnails
    const isImageFocused = selectedImageIndices.includes(imageIndex);
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
};

export default ImagesTable;
