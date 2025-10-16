import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectUserUsername, selectUserCurrentRoles } from '../auth/authSlice.js';
import { hasRole, WRITE_OBJECTS_ROLES } from '../auth/roles.js';
import { setDeleteImagesAlertStatus } from './imagesSlice.js';
import {
  toggleOpenLoupe,
  selectIsAddingLabel,
  addLabelStart,
  addLabelEnd,
  selectIsAddingTag,
  addTagStart,
  addTagEnd,
} from '../loupe/loupeSlice.js';
import {
  setFocus,
  setSelectedImageIndices,
  labelsAdded,
  labelsValidated,
  markedEmpty,
  objectsManuallyUnlocked,
  selectSelectedImages,
  tagsAdded,
} from '../review/reviewSlice.js';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIconLeft,
  ContextMenuSeparator,
} from '../../components/ContextMenu.jsx';
import CategorySelector from '../../components/CategorySelector.jsx';
import {
  CheckIcon,
  Cross2Icon,
  LockOpen1Icon,
  Pencil1Icon,
  ValueNoneIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { Tag } from 'lucide-react';
import BulkTagSelector from '../../components/BulkTagSelector.jsx';

// TODO: redundant component (exists in ImagesTable)
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
      },
    },
  },
});

// TODO: redundant component (exists in ImagesTable)
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

const DataCell = styled(TableCell, {
  margin: '0px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '$2',
  // fontFamily: '$mono',
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
      },
    },
    scrollable: {
      true: {
        overflowY: 'scroll',
        alignItems: 'start',
      },
    },
  },
});

const ImagesTableRow = ({ row, index, focusIndex, style, selectedImageIndices }) => {
  const selected = selectedImageIndices.includes(index);
  const userId = useSelector(selectUserUsername);
  const userRoles = useSelector(selectUserCurrentRoles);
  const isAuthorized = hasRole(userRoles, WRITE_OBJECTS_ROLES);
  const selectedImages = useSelector(selectSelectedImages);
  const dispatch = useDispatch();

  const awaitingPrediction = row.original.awaitingPrediction;

  const handleRowClick = useCallback(
    (e, rowIdx) => {
      if (e.shiftKey) {
        // allow for selection of multiple consecutive images
        // with shift + click
        const start = Math.min(focusIndex.image, rowIdx);
        const end = Math.max(focusIndex.image, rowIdx);
        let selection = [];
        for (let i = start; i <= end; i++) {
          selection.push(i);
        }
        dispatch(setSelectedImageIndices(selection));
      } else if (e.metaKey || e.ctrlKey) {
        // allow for selection of multiple non-consecutive images
        // with command + click on Macs and ctrl + click in Windows
        let selection = [...selectedImageIndices];
        selection.push(Number(rowIdx));
        dispatch(setSelectedImageIndices(selection));
      } else {
        // normal click
        const newIndex = { image: Number(rowIdx), object: null, label: null };
        dispatch(setFocus({ index: newIndex, type: 'manual' }));
        dispatch(toggleOpenLoupe(true));
      }
    },
    [dispatch, focusIndex, selectedImageIndices],
  );

  // TODO: look for opportunities to abstract some of this. Lots of overlap
  // with ImageReviewToolbar and BoundingBox context-menu logic

  // TODO: also, can we move this logic higher up the component tree?
  // Seems crazy to stick it in every row component

  const isAddingLabel = useSelector(selectIsAddingLabel);

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
          labelId: newValue.value || newValue,
          objId: obj._id,
          imgId: image._id,
        }));
      labelsToAdd = labelsToAdd.concat(newLabels);
    }
    dispatch(labelsAdded({ labels: labelsToAdd }));
  };

  // track object states of selected images for disabling context-menu items
  // NOTE: if this evaluation seems to cause performance issues
  // we can always not disable the buttons and perform these checks
  // in the handleMenuItemClick functions
  const allObjectsLocked = selectedImages.every(
    (img) => img.objects && img.objects.every((obj) => obj.locked),
  );
  const allObjectsUnlocked = selectedImages.every(
    (img) => img.objects && img.objects.every((obj) => !obj.locked),
  );
  const hasRenderedObjects = selectedImages.some(
    (img) =>
      img.objects &&
      img.objects.some((obj) =>
        obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
      ),
  );

  // validate all labels
  const handleValidationMenuItemClick = (e, validated) => {
    e.stopPropagation();
    if (allObjectsLocked) return;
    let labelsToValidate = [];
    for (const image of selectedImages) {
      const unlockedObjects = image.objects.filter((obj) => !obj.locked);
      for (const object of unlockedObjects) {
        // find first non-invalidated label in array
        const label = object.labels.find(
          (lbl) => lbl.validation === null || lbl.validation.validated,
        );
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
    console.log('edit all labels clicked');
    e.stopPropagation();
    e.preventDefault();
    if (allObjectsLocked) {
      console.warn('Cannot edit labels when all objects are locked');
      return;
    }
    dispatch(addLabelStart('from-image-table'));
  };

  // unlock all labels
  const handleUnlockMenuItemClick = (e) => {
    e.stopPropagation();
    if (allObjectsUnlocked || !hasRenderedObjects) return;
    let objects = [];
    for (const image of selectedImages) {
      const objectsToUnlock = image.objects
        .filter(
          (obj) =>
            obj.locked &&
            obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
        )
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
          .filter((lbl) => lbl.labelId === 'empty' && !lbl.validated)
          .forEach((lbl) => {
            existingEmptyLabels.push({
              imgId: image._id,
              objId: obj._id,
              lblId: lbl._id,
              userId,
              validated: true,
            });
          });
      });

      if (existingEmptyLabels.length > 0) {
        labelsToValidate = labelsToValidate.concat(existingEmptyLabels);
      } else {
        imagesToMarkEmpty.push({ imgId: image._id });
      }
    }

    if (labelsToValidate.length > 0) {
      dispatch(labelsValidated({ labels: labelsToValidate }));
    }
    if (imagesToMarkEmpty.length > 0) {
      dispatch(markedEmpty({ images: imagesToMarkEmpty, userId }));
    }
  };

  // bulk apply tag
  const isAddingTag = useSelector(selectIsAddingTag);

  const handleApplyTagButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(addTagStart('from-image-table'));
  };

  const handleTagChange = (newValue) => {
    if (!newValue) return;
    const tagsToAdd = selectedImages
      .filter(
        (image) => !image.tags || (image.tags && !image.tags.includes(newValue.value || newValue)),
      )
      .map((image) => ({
        imageId: image._id,
        tagId: newValue.value || newValue,
      }));
    if (tagsToAdd.length === 0) {
      dispatch(addTagEnd());
      return;
    }
    dispatch(tagsAdded({ tags: tagsToAdd }));
  };

  // delete images
  const handleDeleteImagesMenuItemClick = () => {
    dispatch(setDeleteImagesAlertStatus({ openStatus: true, deleteImagesByFilter: false }));
  };

  return (
    <ContextMenu modal={false}>
      {' '}
      {/* modal={false} is fix for pointer-events:none bug: https://github.com/radix-ui/primitives/issues/2416#issuecomment-1738294359 */}
      <ContextMenuTrigger disabled={!selected || !isAuthorized}>
        <TableRow
          {...row.getRowProps({ style })}
          onClick={(e) => handleRowClick(e, row.id)}
          selected={selected}
        >
          {row.cells.map((cell) => {
            let scrollable = false;
            if (cell.column.Header === 'Labels') {
              const nonInvalidatedObjects = cell.value.props.objects.filter((obj) =>
                obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
              );
              scrollable = nonInvalidatedObjects.length >= 3;
            }
            return (
              <DataCell
                {...cell.getCellProps()}
                key={cell.getCellProps().key}
                selected={selected}
                scrollable={scrollable}
              >
                {cell.render('Cell')}
              </DataCell>
            );
          })}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={() => {
          dispatch(addLabelEnd());
          dispatch(addTagEnd());
        }}
        css={{ overflow: 'visible' }}
        sideOffset={5}
        align="end"
      >
        <ContextMenuItem
          onSelect={(e) => handleValidationMenuItemClick(e, true)}
          disabled={isAddingLabel || isAddingTag || awaitingPrediction}
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
          disabled={isAddingLabel || isAddingTag || awaitingPrediction}
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

        {isAddingLabel === 'from-image-table' ? (
          <CategorySelector css={{ width: '100%' }} handleCategoryChange={handleCategoryChange} />
        ) : (
          <ContextMenuItem
            onSelect={handleEditAllLabelsButtonClick}
            disabled={isAddingTag || allObjectsLocked || awaitingPrediction}
          >
            <ContextMenuItemIconLeft>
              <Pencil1Icon />
            </ContextMenuItemIconLeft>
            Edit all labels
          </ContextMenuItem>
        )}

        <ContextMenuItem
          onSelect={handleMarkEmptyMenuItemClick}
          disabled={isAddingLabel || isAddingTag || awaitingPrediction}
        >
          <ContextMenuItemIconLeft>
            <ValueNoneIcon />
          </ContextMenuItemIconLeft>
          Mark empty
        </ContextMenuItem>

        {isAddingTag === 'from-image-table' ? (
          <BulkTagSelector css={{ width: '100%' }} handleTagChange={handleTagChange} />
        ) : (
          <ContextMenuItem onSelect={handleApplyTagButtonClick} disabled={isAddingLabel}>
            <ContextMenuItemIconLeft>
              <Tag size={15} />
            </ContextMenuItemIconLeft>
            Apply tag
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem
          onSelect={handleUnlockMenuItemClick}
          disabled={isAddingLabel || isAddingTag || awaitingPrediction}
        >
          <ContextMenuItemIconLeft>
            <LockOpen1Icon />
          </ContextMenuItemIconLeft>
          Unlock
        </ContextMenuItem>

        <ContextMenuItem
          onSelect={handleDeleteImagesMenuItemClick}
          disabled={isAddingLabel || isAddingTag}
        >
          <ContextMenuItemIconLeft>
            <TrashIcon />
          </ContextMenuItemIconLeft>
          {`Delete image${selectedImageIndices.length > 1 ? 's' : ''}`}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ImagesTableRow;
