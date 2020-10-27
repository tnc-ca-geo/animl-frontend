import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  selectPaginatedField,
  selectSortAscending,
  sortChanged,
} from './imagesSlice';
import {
  selectDetailsIndex,
  imageSelected,
} from '../detailsModal/detailsModalSlice';
import { Image } from '../../components/Image';

const LabelPill = styled.span({
  backgroundColor: '$gray300',
  padding: '$1 $2',
  borderRadius: '4px',
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
  },
  ':last-child': {
    fontFamily: '$mono',
    '.td': {
      borderBottom: '0',
    },
  },
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
  margin: '2px $0',
  display: 'flex',
  alignItems: 'center',
});

const TableHeader = styled.div({
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
    const labelCagegories = <div>{image.labels.map((label, index) => (
      <LabelPill key={index}>{label.category}</LabelPill>
    ))}</div>;

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
  const paginatedFiled = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const detailsIndex = useSelector(selectDetailsIndex);
  const scrollBarSize = useMemo(() => scrollbarWidth(), []);
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const hasMountedRef = useRef(false);
  // TODO: replace with real count when we pull it form back end
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
        Header: 'Date Created',
        accessor: 'dateTimeOriginal',
      },
      {
        Header: 'Labels',
        accessor: 'labelCagegories',
        disableSortBy: true,
      },
      {
        Header: 'Needs Review',
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
    if (detailsIndex) {
      listRef.current.scrollToItem(detailsIndex);
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
            {...row.getRowProps({ style,})}
            onClick={() => handleRowClick(row.id)}
          >
            {row.cells.map(cell => {
              return (
                <DataCell {...cell.getCellProps()}>
                  {cell.render('Cell')}
                </DataCell>
              )
            })}
          </TableRow>
        );
      }
      else {
        console.log('trying to return loadinging row')
        return <div>'Loading...'</div>
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
              height={height - 36}
              itemCount={imagesCount}
              itemSize={100}
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
    [ RenderRow, getTableBodyProps, images, isImageLoaded, imagesCount,
      loadNextPage ]
  );

  return (
    <TableContainer>
      <Table {...getTableProps()} style={{ backgroundColor: 'lavender' }}>
        <div
          style={{ height: '36px', width: `calc(100% - ${scrollBarSize}px)` }}
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
