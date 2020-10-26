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
  imageSelected,
  sortChanged,
} from './imagesSlice';
import { Image } from '../../components/Image';

const LabelPill = styled.span({
  backgroundColor: '$gray300',
  padding: '$1 $2',
  borderRadius: '4px',
});

const Styles = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',

  '.table': {
    height: '100%',
    maxWidth: '100%',
    display: 'inline-block',
    borderSpacing: '$0',

    '.tr': {
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
    },

    '.th, .td': {
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
    },

    '.th': {
      backgroundColor: '$gray200',
      ':hover': {
        cursor: 'auto',
      },
    },

    '.td': {
      backgroundColor: '$loContrast',
      margin: '2px $0',
      display: 'flex',
      alignItems: 'center',
    },
    
  },
});

// TODO: add a wrapper to make horizontally scrollable on smaller screens
//   '.tableWrap': {
//     display: 'block',
//     margin: '$3',
//     maxWidth: '100%',
//     overflowX: 'scroll',
//     overflowY: 'hidden',
//   },

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

const makeRows = (images) => {
  return images.map((image) => {
    const thumbnail = <Image src={image.thumbUrl} />;
    
    const labelCagegories = 
      <div>
        {image.labels.map((label, index) => (
          <LabelPill key={index}>{label.category}</LabelPill>
        ))}
      </div>;

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

const scrollbarWidth = () => {
  // thanks too https://davidwalsh.name/detect-scrollbar-width
  const scrollDiv = document.createElement('div')
  scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;')
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth
}

const ImagesTable = ({ images, hasNext, loadNextPage }) => {
  const dispatch = useDispatch();
  const paginatedFiled = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const imagesCount = hasNext ? images.length + 1 : images.length;
  const isImageLoaded = index => !hasNext || index < images.length;
  const infiniteLoaderRef = useRef(null);
  const hasMountedRef = useRef(false);

  const data = makeRows(images);

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 400, // maxWidth is only used as a limit for resizing
    }),
    []
  )

  const columns = useMemo(() => [
      {
        Header: '',
        accessor: 'thumbnail',
        disableSortBy: true,
        width: '150',
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

  const scrollBarSize = useMemo(() => scrollbarWidth(), [])

  useEffect(() => {
    console.log('sort by changed: ', sortBy);
    // Each time the sort prop changed we called the method resetloadMoreItemsCache to clear the cache
    // We only need to reset cached items when "sortBy" changes.
    // This effect will run on mount too; there's no need to reset in that case.
    if (hasMountedRef.current) {
      if (infiniteLoaderRef.current) {
        infiniteLoaderRef.current.resetloadMoreItemsCache();
      }
    }
    hasMountedRef.current = true;
    dispatch(sortChanged(sortBy));
  }, [sortBy, dispatch]);

  const handleTrClick = useCallback((id) => {
    console.log('tr was clicked for row: ', id);
    dispatch(imageSelected(id));
  }, [dispatch]);

  const RenderRow = useCallback(
    ({ index, style }) => {
    
      if (isImageLoaded(index)) {
        const row = rows[index];
        prepareRow(row);
        return (
          <div
            {...row.getRowProps({
              style,
            })}
            className="tr"
            onClick={() => handleTrClick(row.id)}
          >
            {row.cells.map(cell => {
              return (
                <div {...cell.getCellProps()} className="td">
                  {cell.render('Cell')}
                </div>
              )
            })}
          </div>
        )
      }
      else {
        return <div>'Loading...'</div>
      };
    },
    [prepareRow, rows, handleTrClick, isImageLoaded]
  );

  return (
    <Styles>
      <div {...getTableProps()} className="table" style={{ backgroundColor: 'lavender' }}>
        <div style={{ height: '36px', width: `calc(100% - ${scrollBarSize}px)` }}>
          {headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map(column => (
                <div {...column.getHeaderProps(column.getSortByToggleProps())} className="th">
                  <TableHeader
                    issorted={column.isSorted.toString()}
                    cansort={column.canSort.toString()}
                  >
                    {column.render('Header')}
                    {column.canSort && 
                      <FontAwesomeIcon icon={ 
                        column.isSortedDesc 
                          ? ['fas', 'caret-down'] 
                          : ['fas', 'caret-up']
                      }/>
                    }
                  </TableHeader>
                </div>
              ))}
            </div>
          ))}
        </div>

        <AutoSizer>
          {({ height, width }) => (
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
                    itemSize={120}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    width={width}
                  >
                    { RenderRow }
                  </List>
                )}
              </InfiniteLoader>
            </div>
          )}
        </AutoSizer>
      </div>
    </Styles>
  );  

}

export default ImagesTable;
