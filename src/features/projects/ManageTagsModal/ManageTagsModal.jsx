import React, { useState } from 'react';
import { styled } from '../../../theme/stitches.config';
import { EditableTag } from './EditableTag';
import { EditTag } from './EditTag';
import Button from '../../../components/Button';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner';
import { DeleteTagAlert } from './DeleteTagAlert';

const EditableTagsContainer = styled('div', {
  overflowY: 'scroll',
  padding: '3px', // so that the input boxes' shadow does get cutoff
  maxHeight: '500px'
});

const AddNewTagButtonContainer = styled('div', {
  display: 'flex',
});

const AddNewTagButton = styled(Button, {
  marginRight: 0,
  marginLeft: 'auto',
  marginTop: '$3'
});

const EditTagContainer = styled('div', {
  marginLeft: '3px'
});


export const ManageTagsModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState('');

  const tags = [
    {
      id: "1",
      name: "example tag",
      color: "#E93D82"
    },
    {
      id: "2",
      name: "example tag",
      color: "#00A2C7"
    },
    {
      id: "3",
      name: "example tag",
      color: "#29A383"
    },
  ]

  const onConfirmEdit = (tagId, tagName, tagColor) => {
    console.log("edit", tagId, tagName, tagColor);
  }

  const onConfirmAdd = (tagName, tagColor) => {
    console.log("add", tagName, tagColor);
  }

  const onConfirmDelete = (tagid) => {
    console.log('delete', tagid);
  }

  const onStartDelete = (id) => {
    setTagToDelete(id);
    setIsAlertOpen(true);
  }

  const onCancelDelete = () => {
    console.log("what")
    setIsAlertOpen(false);
    setTagToDelete('');
  }

  return (
    <>
      {isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <EditableTagsContainer>
        { tags.map(({ id, name, color }) => (
          <EditableTag 
            key={id}
            id={id}
            currentName={name}
            currentColor={color}
            allTagNames={tags.map((tag) => tag.name)}
            onConfirmEdit={onConfirmEdit}
            onDelete={(id) => onStartDelete(id)}
          />
        ))}
      </EditableTagsContainer>
      { !isNewTagOpen &&
        <AddNewTagButtonContainer>
          <AddNewTagButton 
            size="small" 
            type="button" 
            onClick={() => setIsNewTagOpen(true)}
          >
            New tag
          </AddNewTagButton>
        </AddNewTagButtonContainer>
      }
      { isNewTagOpen &&
        <EditTagContainer>
          <EditTag 
            allTagNames={tags.map((t) => t.name)}
            onSubmit={onConfirmAdd}
            onCancel={() => setIsNewTagOpen(false)}
            isNewLabel={true}
          />
        </EditTagContainer>
      }
      <DeleteTagAlert 
        open={isAlertOpen} 
        tag={tags.find((tag) => tag.id === tagToDelete)} 
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
