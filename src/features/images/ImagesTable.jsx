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
import { CheckIcon,
  Cross2Icon,
  TriangleUpIcon,
  TriangleDownIcon,
  LockOpen1Icon,
  Pencil1Icon,
  ValueNoneIcon,
  TrashIcon
} from '@radix-ui/react-icons'
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
  setDeleteImagesAlertOpen,
  selectImagesLoading,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import {
  setFocus,
  labelsAdded,
  labelsValidated,
  markedEmpty,
  objectsManuallyUnlocked,
  selectFocusIndex,
  selectFocusChangeType,
  selectSelectedImages,
  setSelectedImageIndices,
  selectSelectedImageIndices
} from '../review/reviewSlice';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice.js';
import { hasRole, WRITE_OBJECTS_ROLES } from '../../auth/roles';
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
  ContextMenuItemIconLeft,
} from '../../components/ContextMenu';
import CreatableSelect from 'react-select/creatable';
import { createFilter } from 'react-select';
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
  // const [ visibleRows, setVisibleRows ] = useState([null, null]);
  const infiniteLoaderRef = useRef(null);
  const listRef = useRef(null);
  const imagesCount = hasNext ? workingImages.length + 1 : workingImages.length;
  const isImageLoaded = useCallback((index) => {
    return !hasNext || index < workingImages.length;
  }, [hasNext, workingImages]);

  // manage image selection
  const selectedImageIndices = useSelector(selectSelectedImageIndices);
  const selectedImages = useSelector(selectSelectedImages);

  const handleRowClick = useCallback((e, rowIdx) => {
    if (e.shiftKey) {
      // allow for selection of multiple images to perform bulk actions on
      const start = Math.min(focusIndex.image, rowIdx);
      const end = Math.max(focusIndex.image, rowIdx);
      let selection = [];
      for (let i = start; i <= end; i++) { selection.push(i); }
      dispatch(setSelectedImageIndices(selection));
    } else {
      const newIndex = { image: Number(rowIdx), object: null, label: null }
      dispatch(setFocus({ index: newIndex, type: 'manual' }));
      dispatch(toggleOpenLoupe(true));
    }
  }, [dispatch, focusIndex]);

  const data = makeRows(workingImages, focusIndex, selectedImageIndices);

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

        const selected = selectedImageIndices.includes(index);
        const userId = useSelector(selectUserUsername);
        const userRoles = useSelector(selectUserCurrentRoles);
        const isAuthorized = hasRole(userRoles, WRITE_OBJECTS_ROLES);

        // TODO: double check that all the "disabled" conditions are consistent 
        // across bounding-box context menu items, ImageReviewToolbar, and the
        // context menu items here

        // TODO: look for opportunities to abstract some of this. Lots of overlap
        // with ImageReviewToolbar and BoundingBox context-menu logic
        // manage category selector state (open/closed)

        // TODO: also, can we move this logic higher up the component tree?
        // Seems crazy to stick it in every row component

        const isAddingLabel = useSelector(selectIsAddingLabel);
        const [ catSelectorOpen, setCatSelectorOpen ] = useState((isAddingLabel === 'from-image-table'));
        useEffect(() => {
          setCatSelectorOpen(((isAddingLabel === 'from-image-table')));
        }, [isAddingLabel]);

        // validate all labels
        const handleValidationMenuItemClick = (e, validated) => {
          e.stopPropagation();
          let labelsToValidate = [];
          for (const image of selectedImages) {
            for (const object of image.objects) {
              if (object.locked) return;
              // find first non-invalidated label in array
              const label = object.labels.find((lbl) => lbl.validation === null || lbl.validation.validated);
              labelsToValidate.push({
                imgId: image._id,
                objId: object._id,
                lblId: label._id,
                userId,
                validated,
              });
            }
          }
          dispatch(labelsValidated({ labels: labelsToValidate }));
        };

        // edit all labels
        const handleEditAllLabelsButtonClick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          dispatch(addLabelStart('from-image-table'));
        };

        // unlock all labels
        const handleUnlockMenuItemClick = (e) => {
          e.stopPropagation();
          let objects = [];
          for (const image of selectedImages) {
            const objectsToUnlock = image.objects
              .filter((obj) => (
                obj.locked && obj.labels.some((lbl) => (
                  lbl.validation === null || lbl.validation.validated
                ))
              ))
              .map((obj) => ({ imgId: image._id, objId: obj._id }));
            
            objects = objects.concat(objectsToUnlock);
          }
          dispatch(objectsManuallyUnlocked({ objects }));
        };

        // mark all images as empty
        const handleMarkEmptyMenuItemClick = () => {
          let imagesToMarkEmpty = [];
          let labelsToValidate = [];
          for (const image of selectedImages) {

            let existingEmptyLabels = [];
            image.objects.forEach((obj) => {
              obj.labels
                .filter((lbl) => lbl.category === 'empty' && !lbl.validated)
                .forEach((lbl) => {
                  existingEmptyLabels.push({
                    imgId: image._id,
                    objId: obj._id,
                    lblId: lbl._id,
                    userId,
                    validated: true
                  });
              });
            });

            if (existingEmptyLabels.length > 0) {
              labelsToValidate = labelsToValidate.concat(existingEmptyLabels);;
            } else {
              imagesToMarkEmpty.push({ imgId: image._id });
            }
          }

          if (labelsToValidate.length > 0) {
            dispatch(labelsValidated({ labels: labelsToValidate }))
          }
          if (imagesToMarkEmpty.length > 0) {
            dispatch(markedEmpty({ images: imagesToMarkEmpty, userId }));
          }
        };

        const handleDeleteImagesMenuItemClick = () => {
          dispatch(setDeleteImagesAlertOpen(true));
        };

        return (
          <ContextMenu modal={false}> {/* modal={false} is fix for pointer-events bug: https://github.com/radix-ui/primitives/issues/2416#issuecomment-1738294359 */}
            <ContextMenuTrigger disabled={!selected || !isAuthorized}>
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
              onCloseAutoFocus={() => dispatch(addLabelEnd()) }
              css={{ overflow: 'visible' }}
              sideOffset={5}
              align='end'
            >
              <ContextMenuItem
                onSelect={(e) => handleValidationMenuItemClick(e, true)}
                disabled={isAddingLabel}
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
                onSelect={(e) => handleValidationMenuItemClick(e, false)}
                disabled={isAddingLabel}
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
                ? (<CategorySelector selectedImages={selectedImages} userId={userId} />)
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
              <ContextMenuItem
                onSelect={handleUnlockMenuItemClick}
                disabled={isAddingLabel}
              >
                <ContextMenuItemIconLeft>
                  <LockOpen1Icon />
                </ContextMenuItemIconLeft>
                Unlock
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={handleMarkEmptyMenuItemClick}
                disabled={isAddingLabel}
              >
                <ContextMenuItemIconLeft>
                  <ValueNoneIcon />
                </ContextMenuItemIconLeft>
                Mark empty
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={handleDeleteImagesMenuItemClick}
                disabled={isAddingLabel}
              >
                <ContextMenuItemIconLeft>
                  <TrashIcon />
                </ContextMenuItemIconLeft>
                Delete images
              </ContextMenuItem>
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

// TODO: make this it's own component. 
// Used in ImageReviewToolbar and BoundingBoxLabel

const StyledCategorySelector = styled(CreatableSelect, {
  width: '100%',
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

const CategorySelector = ({ selectedImages, userId }) => {
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
    console.log('handleCategorySelectorBlur');
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
      menuPlacement='top'
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
