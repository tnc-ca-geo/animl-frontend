import React, { useEffect, useState } from 'react';
import { styled } from "../../theme/stitches.config";
import { mauve } from '@radix-ui/colors';
import { ImageTag } from "./ImageTag.jsx";
import { TagSelector } from '../../components/TagSelector.jsx';
import { editTag } from '../review/reviewSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjectTags } from '../projects/projectsSlice.js';

const Toolbar = styled('div', {
  display: 'flex',
  height: 'calc(32px + $2 + $2)',
  width: '100%',
  borderBottom: '1px solid $border',
  position: 'relative'
});

const TagsContainer = styled('div', {
  position: 'relative',
  width: '100%'
});

const TagSelectorContainer = styled('div', {
  margin: '$2',
  marginRight: '0',
  display: 'grid',
  placeItems: 'center'
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
});

const Separator = styled('div', {
  width: '1px',
  backgroundColor: mauve.mauve6,
  margin: '$2 10px'
});

const getImageTagInfo = (imageTags, projectTags) => {
  return projectTags.filter((t) => {
    return imageTags.find((it) => it === t._id) !== undefined
  });
}

const getUnaddedTags = (imageTags, projectTags) => {
  return projectTags.filter((t) => imageTags.indexOf(t._id) === -1)
}

export const ImageTagsToolbar = ({
  image
}) => {
  const dispatch = useDispatch();
  const projectTags = useSelector(selectProjectTags);
  const [imageTags, setImageTags] = useState(image.tags ?? []);
  const [unaddedTags, setUnaddedTags] = useState([]);

  useEffect(() => {
    const imageTagInfo = getImageTagInfo(image.tags ?? [], projectTags);
    setImageTags(imageTagInfo);
    setUnaddedTags(getUnaddedTags(image.tags ?? [], projectTags));
  }, [image, projectTags])

  useEffect(() => {
    const imageTagInfo = getImageTagInfo(image.tags ?? [], projectTags);
    setImageTags(imageTagInfo);
    setUnaddedTags(getUnaddedTags(image.tags ?? [], projectTags));
  }, []);

  const onDeleteTag = (tagId) => {
    const deleteTagDto = {
      tagId: tagId,
      imageId: image._id
    };
    dispatch(editTag('delete', deleteTagDto));
  }

  const onAddTag = ({ value }) => {
    const addTagDto = {
      tagId: value,
      imageId: image._id
    };
    dispatch(editTag('create', addTagDto));
  }

  return (
    <Toolbar>
      <TagSelectorContainer>
        <TagSelector 
          tags={unaddedTags}
          handleTagChange={(tag) => onAddTag(tag)} 
        />
      </TagSelectorContainer>
      <Separator />
      <TagsContainer>
        <ScrollContainer>
          { imageTags.map(({ _id, name, color }) => (
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
}
