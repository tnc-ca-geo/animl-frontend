import React, { useEffect, useState } from 'react';
import { styled } from '../theme/stitches.config';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';
import {
  BottomUpInput,
  BottomUpMenuClosePanelButton,
  BottomUpMenuContent,
  BottomUpMenuHeader,
  BottomUpMenuOverlay,
} from './BottomUpMenu';
import {
  labelsAdded,
  selectMobileCategorySelectorFocus,
  selectWorkingImages,
  setMobileCategorySelectorFocus,
} from '../features/review/reviewSlice';
import {
  selectProjectLabelsLoading,
  selectSelectedProject,
} from '../features/projects/projectsSlice';
import { X } from 'lucide-react';
import { SimpleSpinner, SpinnerOverlay } from './Spinner';
import { selectUserUsername } from '../features/auth/authSlice';
import { compareLabelNames } from './CategorySelector';

const ContentContainer = styled('div', {
  overflowY: 'scroll',
  backgroundColor: '$loContrast',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const CategorySelectorContainer = styled('div', {
  padding: '$3 $3',
  overflowY: 'scroll',
});

const SearchRow = styled('div', {
  marginTop: 'auto',
  borderTop: '1px solid $border',
  padding: '$3',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$backgroundLight',
});

const Label = styled('div', {
  fontFamily: '$mono',
  padding: '$1',
  '&:hover': {
    backgroundColor: '$backgroundDark',
    cursor: 'pointer',
  },
});

export const CategorySelectorDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const workingImages = useSelector(selectWorkingImages);
  const labelsLoading = useSelector(selectProjectLabelsLoading);
  const project = useSelector(selectSelectedProject);
  const { imageId, objectId } = useSelector(selectMobileCategorySelectorFocus);
  const userId = useSelector(selectUserUsername);
  const dispatch = useDispatch();

  const enabledLabels = project.labels
    .filter((lbl) => lbl.reviewerEnabled)
    .sort((lbl1, lbl2) => compareLabelNames(lbl1.name, lbl2.name));
  const [filteredLabels, setFilteredLabels] = useState(enabledLabels);
  const image = workingImages.find((img) => img._id === imageId);

  useEffect(() => {
    setIsOpen(imageId !== null && imageId !== undefined);
  }, [imageId]);

  const handleClose = () => {
    setIsOpen(false);
    setFilteredLabels(enabledLabels);
    dispatch(setMobileCategorySelectorFocus({ imageId: null, objectId: null }));
  };

  const onLabelChange = (newLabel) => {
    if (!newLabel) {
      return;
    }

    const labelsToAdd = image.objects
      .filter((obj) => (objectId ? obj._id === objectId : true))
      .filter((obj) => !obj.locked)
      .map((obj) => {
        return {
          objIsTemp: obj.isTemp,
          userId,
          bbox: obj.bbox,
          labelId: newLabel,
          objId: obj._id,
          imgId: image._id,
        };
      })
      .reduce((acc, obj) => [...acc, obj], []);
    dispatch(labelsAdded({ labels: labelsToAdd }));
    handleClose();
  };

  const onSearch = (searched) => {
    if (searched === '' || !searched) {
      setFilteredLabels(enabledLabels);
    }
    searched = searched.toLowerCase().trim();
    const filtered = enabledLabels.filter((lbl) => {
      return lbl.name.toLowerCase().includes(searched);
    });
    setFilteredLabels(filtered);
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <BottomUpMenuContent onPointerDownOutside={() => handleClose()}>
          <ContentContainer>
            <BottomUpMenuHeader>
              Labels
              <BottomUpMenuClosePanelButton variant="ghost" onClick={() => handleClose()}>
                <X />
              </BottomUpMenuClosePanelButton>
            </BottomUpMenuHeader>
            <CategorySelectorContainer>
              <>
                {labelsLoading.isLoading && (
                  <SpinnerOverlay>
                    <SimpleSpinner />
                  </SpinnerOverlay>
                )}
                {filteredLabels.map(({ name, _id }) => (
                  <Label key={_id} onClick={() => onLabelChange(_id)}>
                    {name || 'ERROR FINDING LABEL'}
                  </Label>
                ))}
              </>
            </CategorySelectorContainer>
            <SearchRow>
              <BottomUpInput onChange={(e) => onSearch(e.target.value)} placeholder="Search..." />
            </SearchRow>
          </ContentContainer>
        </BottomUpMenuContent>
        <BottomUpMenuOverlay />
      </Dialog.Portal>
    </Dialog.Root>
  );
};
