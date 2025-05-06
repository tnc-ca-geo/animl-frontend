import React from 'react';
import { styled } from '../../theme/stitches.config';
import FullSizeImage from './FullSizeImage';
import ImageReviewToolbar from './ImageReviewToolbar';
import { ImageTagsToolbar } from './ImageTagsToolbar';
import { /*useDispatch,*/ useSelector } from 'react-redux';
// import { selectUserCurrentRoles, selectUserUsername } from '../auth/authSlice';
import { selectProjectTags } from '../projects/projectsSlice';
// import { hasRole, WRITE_OBJECTS_ROLES } from '../auth/roles.js';
import { ImageMetadata } from './ImageMetadata';

const FullSizeImageWrapper = styled('div', {
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
});

const ToolbarContainer = styled('div', {
  height: '145px',
});

export const SmallScreensLoupe = ({
  image,
  idx,
  workingImages,
  shouldShowToolbar,
  style,
}) => {
  // const userId = useSelector(selectUserUsername);
  // const dispatch = useDispatch();
  const projectTags = useSelector(selectProjectTags);

  return (
    <FullSizeImageWrapper style={style}>
      <ImageMetadata image={image} />
      <FullSizeImage
        workingImages={workingImages}
        image={image}
        focusIndex={{ image: idx }}
        css={{ height: '100%', width: '100%', objectFit: 'contain' }}
      />
      {shouldShowToolbar && (
        <ToolbarContainer>
          <ImageReviewToolbar 
            image={image}
            lastAction={null}
            handleRepeatAction={() => console.log("repeat")}
            handleValidateAllButtonClick={() => console.log("validate")}
            handleMarkEmptyButtonClick={() => console.log("empty")}
            handleAddObjectButtonClick={() => console.log("add")}
            handleUnlockAllButtonClick={() => console.log("unlock")}
          />
          <ImageTagsToolbar
            image={image}
            projectTags={projectTags}
          />
        </ToolbarContainer>
      )}
    </FullSizeImageWrapper>
  );
}
