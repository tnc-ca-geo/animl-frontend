import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  forwardRef
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DateTime } from 'luxon';
import { green, orange } from '@radix-ui/colors';
import { CheckIcon, Cross2Icon, TriangleUpIcon, TriangleDownIcon, LockOpen1Icon, Pencil1Icon } from '@radix-ui/react-icons'
import useScrollbarSize from 'react-scrollbar-size';
import { useEffectAfterMount } from '../../app/utils';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy, useFlexLayout, useResizeColumns } from 'react-table';
import useBreakpoints from '../../hooks/useBreakpoints';
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
  labelsAdded,
  selectFocusIndex,
  selectFocusChangeType
} from '../review/reviewSlice';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice.js';
import { selectAvailLabels } from '../filters/filtersSlice.js';
import { selectIsAddingLabel, addLabelStart, addLabelEnd } from '../loupe/loupeSlice.js';
import { Image } from '../../components/Image';
import LabelPills from './LabelPills';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectProjectsLoading } from '../projects/projectsSlice';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuItemIconLeft
} from '../../components/ContextMenu';
import CreatableSelect from 'react-select/creatable';
import { createFilter } from 'react-select';



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
  // const [ visibleRows, setVisibleRows ] = useState([null, null]);
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const imagesCount = hasNext ? workingImages.length + 1 : workingImages.length;
  const isImageLoaded = useCallback((index) => {
    return !hasNext || index < workingImages.length;
  }, [hasNext, workingImages]);

  const [ selectedRows, setSelectedRows ] = useState([]);
  useEffect(() => {
    if (focusIndex.image !== null) {
      setSelectedRows([focusIndex.image]);
    }
    else {
      setSelectedRows([]);
    }
  }, [focusIndex.image]);

  const handleRowClick = useCallback((e, rowIdx) => {
    if (e.shiftKey) {
      // allow for selection of multiple images to perform bulk actions on
      const start = Math.min(focusIndex.image, rowIdx);
      const end = Math.max(focusIndex.image, rowIdx);
      let selection = [];
      for (let i = start; i <= end; i++) { selection.push(i); }
      setSelectedRows(selection);
    } else {
      const newIndex = { image: Number(rowIdx), object: null, label: null }
      dispatch(setFocus({ index: newIndex, type: 'manual' }));
      dispatch(toggleOpenLoupe(true));
    }
  }, [dispatch, focusIndex]);

  const data = makeRows(workingImages, focusIndex, selectedRows);

  const defaultColumn = useMemo(() => ({
    minWidth: 30,
    width: 100, // width is used for both the flex-basis and flex-grow
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

  // responsively hide/show table columns
  const { ref, breakpoint } = useBreakpoints([
    ['xxs', 540],
    ['xs', 640],
    ['sm', 740],
    ['md', 840],
    ['lg', 940],
    ['xl', Infinity]
  ]);

  const columnsToHide = useMemo(() => ({
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
      if (isImageLoaded(index)) {
        const row = rows[index];
        prepareRow(row);
        const selected = selectedRows.includes(index);
        const selectedImages = selectedRows.map((rowIdx) => workingImages[rowIdx]);

        // manage category selector state (open/closed)
        const isAddingLabel = useSelector(selectIsAddingLabel);
        const [ catSelectorOpen, setCatSelectorOpen ] = useState((isAddingLabel === 'from-image-table'));
        useEffect(() => {
          setCatSelectorOpen(((isAddingLabel === 'from-image-table')));
        }, [isAddingLabel]);

        const catSelectorRef = useRef(null);

        const handleEditAllLabelsButtonClick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          dispatch(addLabelStart('from-image-table'));
        };

        return (
          <ContextMenu>
            <ContextMenuTrigger disabled={!selected}>
              <TableRow
                {...row.getRowProps({ style })}
                onClick={(e) => handleRowClick(e, row.id)}
                selected={selected}
              >
                {row.cells.map(cell => (
                  <DataCell
                    {...cell.getCellProps()}
                    selected={selected}
                    scrollable={
                      cell.column.Header === 'Labels' && 
                      cell.value.props.objects.length > 3
                    }
                  >
                    {cell.render('Cell')}
                  </DataCell>
                ))}
              </TableRow>
            </ContextMenuTrigger>
            <ContextMenuContent
              sideOffset={5}
              align='end'
            >
              <ContextMenuItem
                onSelect={() => console.log('Validate all labels')}
                disabled={false}
                css={{
                  color: '$successText',
                  '&[data-highlighted]': {
                    backgroundColor: '$successBase',
                    color: '$successBg',
                  },
                }}
              >
                <ContextMenuItemIconLeft>
                  <CheckIcon />
                </ContextMenuItemIconLeft>
                Validate
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => console.log('Invalidate all labels')}
                disabled={false}
                css={{
                  color: '$errorText',
                  '&[data-highlighted]': {
                    backgroundColor: '$errorBase',
                    color: '$errorBg',
                  },
                }}
              >
                <ContextMenuItemIconLeft>
                  <Cross2Icon />
                </ContextMenuItemIconLeft>
                Invalidate
              </ContextMenuItem>
              {catSelectorOpen
                ? (<CategorySelector selectedImages={selectedImages} />)
                : (<ContextMenuItem
                    onSelect={handleEditAllLabelsButtonClick}
                    disabled={false}
                  >
                    <ContextMenuItemIconLeft>
                      <Pencil1Icon />
                    </ContextMenuItemIconLeft>
                    Edit all labels
                  </ContextMenuItem>)
              }
            </ContextMenuContent>
          </ContextMenu>
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
    </TableContainer>
  );  
};

function makeRows(workingImages, focusIndex, selectedRows) {
  return workingImages.map((img, imageIndex) => {
    // thumbnails
    const isImageFocused = selectedRows.includes(imageIndex);
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

// TODO: make this it's own component. 
// Used in ImageReviewToolbar and BoundingBoxLabel

const StyledCategorySelector = styled(CreatableSelect, {
  width: '155px',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '$1',
  zIndex: '$5',
  '.react-select__control': {
    boxSizing: 'border-box',
    // height: '24px',
    minHeight: 'unset',
    border: '1px solid',
    borderColor: '$border',
    borderRadius: '$2',
    cursor: 'pointer',
  },
  '.react-select__single-value': {
    // position: 'relative',
  },
  '.react-select__indicator-separator': {
    display: 'none',
  },
  '.react-select__dropdown-indicator': {
    paddingTop: '0',
    paddingBottom: '0',
  },
  '.react-select__control--is-focused': {
    transition: 'all 0.2s ease',
    boxShadow: '0 0 0 3px $blue200',
    borderColor: '$blue500',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
  '.react-select__menu': {
    color: '$textDark',
    fontSize: '$3',
    '.react-select__option': {
      cursor: 'pointer',
    },
    '.react-select__option--is-selected': {
      color: '$blue500',
      backgroundColor: '$blue200',
    },
    '.react-select__option--is-focused': {
      backgroundColor: '$gray3',
    },
  }
});

const CategorySelector = ({ selectedImages }) => {
  const userId = useSelector(selectUserUsername);
  const dispatch = useDispatch();
  // update selector options when new labels become available
  const createOption = (category) => ({ value: category.toLowerCase(), label: category });
  const availLabels = useSelector(selectAvailLabels);
  const options = availLabels.ids.map((id) => createOption(id));

  const handleCategoryChange = (newValue) => {
    if (!newValue) return;
    let labelsToAdd = [];
    for (const image of selectedImages) {
      const newLabels = image.objects
        .filter((obj) => !obj.locked)
        .map((obj) => ({
          objIsTemp: obj.isTemp,
          userId,
          bbox: obj.bbox,
          category: newValue.value || newValue,
          objId: obj._id,
          imgId: image._id
        }));
        labelsToAdd = labelsToAdd.concat(newLabels);
    }
    dispatch(labelsAdded({ labels: labelsToAdd }));
  };

  const handleCategorySelectorBlur = (e) => {
    console.log('handleCategorySelectorBlur')
    dispatch(addLabelEnd());
  };

  return (
    <StyledCategorySelector
      autoFocus
      isClearable
      isSearchable
      openMenuOnClick
      className='react-select'
      classNamePrefix='react-select'
      menuPlacement='bottom'
      filterOption={createFilter({ matchFrom: 'start' })} // TODO: what does this do?
      isLoading={availLabels.isLoading}
      isDisabled={availLabels.isLoading}
      onChange={handleCategoryChange}
      onCreateOption={handleCategoryChange}
      onBlur={handleCategorySelectorBlur}
      // value={createOption(label.category)}
      options={options}
    />
  );
};

export default ImagesTable;
