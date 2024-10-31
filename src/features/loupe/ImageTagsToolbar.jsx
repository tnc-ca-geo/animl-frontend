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
  console.log("img", imageTags)
  console.log("proj", projectTags)
  return projectTags.filter((t) => {
    return imageTags.find((it) => it === t._id) !== undefined
  });
}

export const ImageTagsToolbar = ({
  image
}) => {
  const dispatch = useDispatch();
  const projectTags = useSelector(selectProjectTags);
  const [imageTags, setImageTags] = useState(image.tags ?? []);

  console.log("tg", image.tags)

  useEffect(() => {
    const imageTagInfo = getImageTagInfo(image.tags ?? [], projectTags);
    setImageTags(imageTagInfo);
  }, [image, projectTags])

  useEffect(() => {
    const imageTagInfo = getImageTagInfo(image.tags ?? [], projectTags);
    console.log(imageTagInfo)
    setImageTags(imageTagInfo);
  }, []);

  const onDeleteTag = (tagId) => {
    console.log(`delete tag: ${tagId}`)
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
          handleTagChange={(tag) => onAddTag(tag)} 
        />
      </TagSelectorContainer>
      <Separator />
      <TagsContainer>
        <ScrollContainer>
          { imageTags.map(({ id, name, color }) => (
            <ImageTag
              key={id}
              id={id}
              name={name}
              color={color}
              onDelete={onDeleteTag}
            />
          ))}
        </ScrollContainer>
      </TagsContainer>
    </Toolbar>
  );
}
