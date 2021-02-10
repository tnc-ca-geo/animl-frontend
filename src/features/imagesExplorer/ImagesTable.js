import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled, labelColors } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  selectPaginatedField,
  selectSortAscending,
  sortChanged,
  visibleRowsChanged,
} from './imagesSlice';
import {
  selectDetailsIndex,
  imageSelected,
} from '../detailsModal/detailsModalSlice';
import { Image } from '../../components/Image';

const LabelPill = styled('div', {
  // backgroundColor: '$gray300',
  // border: '$1 solid $hiContrast',
  color: '$hiContrast',
  fontSize: '$2',
  fontFamily: '$mono',
  padding: '$1 $3',
  marginRight: '$2',
  marginBottom: '$2',
  borderRadius: '$3',
  // textTransform: 'uppercase',
});

const LabelContainer = styled('div', {
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
});
// TODO: make table horizontally scrollable on smaller screens
//   '.tableWrap': {
//     display: 'block',
//     margin: '$3',
//     maxWidth: '100%',
//     overflowX: 'scroll',
//     overflowY: 'hidden',
//   },

const TableContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
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
        backgroundColor: '$gray300',
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

const makeRows = (images) => {
  return images.map((image) => {
    const thumbnail = <Image src={image.thumbUrl} />;
    const labelCagegories = <LabelContainer>{image.labels.map((label, index) => (
      <LabelPill
        key={index}
        css={{
          backgroundColor: labelColors[label.category].primary + 'b3', 
        }}
      >
        {label.category}
      </LabelPill>
    ))}</LabelContainer>;

    let needsReview = 'Yes'; 
    image.labels.forEach((label) => {
      if (label.validation.reviewed) {
        needsReview = 'No';
      }
    });

    return {
      thumbnail,
      labelCagegories,
      needsReview,
      ...image,
    }
  })
};

const ImagesTable = ({ images, hasNext, loadNextPage }) => {
  const dispatch = useDispatch();
  const selectedImageIndex = useSelector(selectDetailsIndex);
  const paginatedFiled = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const detailsIndex = useSelector(selectDetailsIndex);
  const scrollBarSize = useMemo(() => scrollbarWidth(), []);
  const [ visibleRows, setVisibleRows ] = useState([null, null]);
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const hasMountedRef = useRef(false);
  const imagesCount = hasNext ? images.length + 1 : images.length;
  const isImageLoaded = useCallback((index) => {
    return !hasNext || index < images.length;
  }, [hasNext, images]);

  const data = makeRows(images);

  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 400,
    }),
    []
  );

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
        accessor: 'labelCagegories',
        disableSortBy: true,
        width: '250',
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

  useEffect(() => {
    dispatch(visibleRowsChanged(visibleRows))
  }, [dispatch, visibleRows]);

  useEffect(() => {
    if (detailsIndex) {
      // TODO: make auto scrolling smooth:
      // https://github.com/bvaughn/react-window/issues/16
      listRef.current.scrollToItem(detailsIndex, 'smart');
    }
  }, [detailsIndex]);

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

  const handleRowClick = useCallback((id) => {
    dispatch(imageSelected(id));
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
            selected={selectedImageIndex === index}
          >
            {row.cells.map(cell => {
              return (
                <DataCell
                  {...cell.getCellProps()}
                  selected={selectedImageIndex === index}
                >
                  {cell.render('Cell')}
                </DataCell>
              )
            })}
          </TableRow>
        );
      }
      else {
        return(
          <TableRow>
            loading...
          </TableRow>
        )
      };
    },
    [prepareRow, rows, handleRowClick, isImageLoaded]
  );

  const InfiniteList = useCallback(
    ({ height, width }) => (
      <div {...getTableBodyProps()}>
        <InfiniteLoader
          ref={infiniteLoaderRef}
          items={images}
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
                setVisibleRows([visibleStartIndex, visibleStopIndex]);
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
    [ RenderRow, getTableBodyProps, images, isImageLoaded, imagesCount,
      loadNextPage ]
  );

  return (
    <TableContainer>
      <Table {...getTableProps()} style={{ backgroundColor: 'lavender' }}>
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
                      <FontAwesomeIcon icon={ column.isSortedDesc 
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
    </TableContainer>
  );  
}

export default ImagesTable;
