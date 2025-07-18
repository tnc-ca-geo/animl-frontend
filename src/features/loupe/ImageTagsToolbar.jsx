import React from 'react';
import { styled } from '../../theme/stitches.config';
import { mauve } from '@radix-ui/colors';
import { ImageTag } from './ImageTag.jsx';
import { TagSelector } from '../../components/TagSelector.jsx';
import { tagsAdded, editTag } from '../review/reviewSlice.js';
import { useDispatch } from 'react-redux';

const Toolbar = styled('div', {
  display: 'flex',
  height: 'calc(32px + $2 + $2)',
  width: '100%',
  borderBottom: '1px solid $border',
  position: 'relative',
});

const TagsContainer = styled('div', {
  position: 'relative',
  width: '100%',
});

const TagSelectorContainer = styled('div', {
  margin: '$2',
  marginRight: '0',
  display: 'grid',
  placeItems: 'center',
});

const ScrollContainer = styled('div', {
  position: 'absolute',
  width: '100%',
  height: '48px',
  display: 'flex',
  gap: '$2',
  overflowX: 'scroll',
  whiteSpace: 'nowrap',
  left: 0,
  top: 0,
  padding: '$2 0',
  scrollbarWidth: 'none',
  paddingRight: '$2',
});

const Separator = styled('div', {
  width: '1px',
  backgroundColor: mauve.mauve6,
  margin: '$2 10px',
});

const getImageTagInfo = (imageTags, projectTags) => {
  return projectTags.filter((t) => {
    return imageTags.find((it) => it === t._id) !== undefined;
  });
};

const getUnaddedTags = (imageTags, projectTags) => {
  return projectTags.filter((t) => imageTags.findIndex((it) => it === t._id) === -1);
};

// Sort alphabetically with JS magic
const orderUnaddedTags = (unaddedTags) => {
  return unaddedTags.sort((a, b) => a.name.localeCompare(b.name));
};

export const ImageTagsToolbar = ({ image, projectTags }) => {
  const dispatch = useDispatch();

  // const [imageTags, setImageTags] = useState(getImageTagInfo(image.tags ?? [], projectTags));
  const imageTags = getImageTagInfo(image.tags ?? [], projectTags);

  // const [unaddedTags, setUnaddedTags] = useState(
  //   orderUnaddedTags(getUnaddedTags(image.tags ?? [], projectTags)),
  // );
  const unaddedTags = orderUnaddedTags(getUnaddedTags(image.tags ?? [], projectTags));

  // // TODO: is reacting to image._id changes necessary? The whole component should re-render when the image changes
  // // image._id -> when the enlarged image changes
  // // projectTags -> so that newly added project tags show up without refreshing
  // useEffect(() => {
  //   console.log('ImageTagsToolbar useEffect - image._id:', image._id);
  //   console.log('ImageTagsToolbar useEffect - projectTags:', projectTags);
  //   setImageTags(getImageTagInfo(image.tags ?? [], projectTags));
  //   setUnaddedTags(orderUnaddedTags(getUnaddedTags(image.tags ?? [], projectTags)));
  // }, [image._id, projectTags]);

  const onDeleteTag = (tagId) => {
    const deleteTagDto = {
      tagId: tagId,
      imageId: image._id,
    };
    // const idx = imageTags.findIndex((t) => t._id === tagId);
    // if (idx >= 0) {
    //   const removed = imageTags.splice(idx, 1);
    //   setImageTags([...imageTags]);
    //   setUnaddedTags(orderUnaddedTags([...unaddedTags, ...removed]));
    // }
    dispatch(editTag('delete', deleteTagDto));
  };

  const onAddTag = (tag) => {
    const addTagDto = {
      tagId: tag._id,
      imageId: image._id,
    };
    // const idx = unaddedTags.findIndex((t) => t._id === tag._id);
    // if (idx >= 0) {
    //   setImageTags([...imageTags, tag]);
    //   unaddedTags.splice(idx, 1);
    //   setUnaddedTags(orderUnaddedTags([...unaddedTags]));
    // }
    dispatch(tagsAdded({ tags: [addTagDto] }));
  };

  return (
    <Toolbar>
      <TagSelectorContainer>
        <TagSelector
          projectTags={projectTags}
          unaddedTags={unaddedTags}
          onAddTag={onAddTag}
          imageId={image._id}
        />
      </TagSelectorContainer>
      <Separator />
      <TagsContainer>
        <ScrollContainer>
          {imageTags.map(({ _id, name, color }) => (
            <ImageTag
              key={_id}
              id={_id}
              name={name}
              color={color}
              onDelete={(tagId) => onDeleteTag(tagId)}
            />
          ))}
        </ScrollContainer>
      </TagsContainer>
    </Toolbar>
  );
};
