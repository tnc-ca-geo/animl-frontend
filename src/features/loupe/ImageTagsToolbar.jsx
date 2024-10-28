import React from 'react';
import { styled } from "../../theme/stitches.config";
import CategorySelector from '../../components/CategorySelector.jsx';
import { mauve } from '@radix-ui/colors';
import { ImageTag } from "./ImageTag.jsx";

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

export const ImageTagsToolbar = () => {
  const tags = [
    {
      id: `${Math.random()}`,
      name: 'example',
      color: '#B06D2F',
      onDelete: () => {console.log("hello")}
    },
    {
      id: `${Math.random()}`,
      name: 'example 2',
      color: '#3C6DDE',
      onDelete: () => {console.log("hello")}
    },
    {
      id: `${Math.random()}`,
      name: 'example 3',
      color: '#08C04C',
      onDelete: () => {console.log("hello")}
    },
    {
      id: `${Math.random()}`,
      name: 'example',
      color: '#EEBC03',
      onDelete: () => {console.log("hello")}
    },
    {
      id: `${Math.random()}`,
      name: 'example 2',
      color: '#3CE26E',
      onDelete: () => {console.log("hello")}
    },
    {
      id: `${Math.random()}`,
      name: 'example 3',
      color: '#C31C76',
      onDelete: () => {console.log("hello")}
    },
  ]

  return (
    <Toolbar>
      <TagSelectorContainer>
        <CategorySelector handleCategoryChange={() => console.log("cat chagen")} />
      </TagSelectorContainer>
      <Separator />
      <TagsContainer>
        <ScrollContainer>
          { tags.map(({ id, name, color, onDelete }) => (
            <ImageTag
              key={id}
              id={id}
              name={name}
              color={color}
              onDelete={onDelete}
            />
          ))}
        </ScrollContainer>
      </TagsContainer>
    </Toolbar>
  );
}
