import React, { useState } from 'react';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import IconButton from '../../../components/IconButton';
import { styled } from '../../../theme/stitches.config';
import { EditTag } from './EditTag';

const Container = styled('div', {
  paddingTop: '$2',
  borderBottom: '1px solid $border'
});

const Inner = styled('div', {
  marginBottom: '$2',
  display: 'flex',
});

const TagName = styled('div', {
  padding: '$1 $3',
  borderRadius: '$2',
  border: '1px solid rgba(0,0,0,0)',
  color: '$textDark',
  fontFamily: '$mono',
  fontWeight: 'bold',
  fontSize: '$2',
  display: 'grid',
  placeItems: 'center'
});

const Actions = styled('div', {
  marginRight: 0,
  marginLeft: 'auto',
  display: 'flex',
  gap: '$3'
});

export const EditableTag = ({
  id,
  currentName,
  currentColor,
  allTagNames,
  onConfirmEdit,
  onDelete
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewColor, setPreviewColor] = useState(currentColor);

  const onEdit = (newName, newColor) => {
    onConfirmEdit(id, newName, newColor);
    setIsEditOpen(false);
  }

  return (
    <Container>
      <Inner>
        <TagName css={{ 
          borderColor: previewColor,
          backgroundColor: `${previewColor}1A`,
        }}>
          { currentName }
        </TagName>
        <Actions>
          <IconButton
            variant='ghost'
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil1Icon />
          </IconButton>
          <IconButton
            variant='ghost'
            onClick={() => onDelete(id)}
          >
            <TrashIcon />
          </IconButton>
        </Actions>
      </Inner>

      {/* Tag edit form */}
      { isEditOpen &&
        <EditTag 
          id={id}
          currentName={currentName}
          currentColor={currentColor}
          onPreviewColor={(newColor) => setPreviewColor(newColor)}
          allTagNames={allTagNames}
          onSubmit={(_id, newName, newColor) => onEdit(newName, newColor)}
          onCancel={() => setIsEditOpen(false)}
        />
      }
    </Container>
  );
}
