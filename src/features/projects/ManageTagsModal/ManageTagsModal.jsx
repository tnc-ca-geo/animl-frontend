import React, { useEffect, useState } from 'react';
import { styled } from '../../../theme/stitches.config';
import { EditableTag } from './EditableTag';
import { EditTag } from './EditTag';
import Button from '../../../components/Button';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner';
import { DeleteTagAlert } from './DeleteTagAlert';
import { useDispatch, useSelector } from 'react-redux';
import { createProjectTag, deleteProjectTag, selectTags, updateProjectTag } from '../projectsSlice';

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
  const dispatch = useDispatch();
  const tags = useSelector(selectTags);

  const [isLoading, setIsLoading] = useState(false);
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState('');

  // TODO
  // to avoid lint error
  useEffect(() => {
    setIsLoading(false)
  })

  const onConfirmEdit = (tagId, tagName, tagColor) => {
    console.log("edit", tagId, tagName, tagColor);
    dispatch(updateProjectTag({ _id: tagId, name: tagName, color: tagColor }));
  }

  const onConfirmAdd = (tagName, tagColor) => {
    dispatch(createProjectTag({ name: tagName, color: tagColor }));
    setIsNewTagOpen(false);
  }

  const onConfirmDelete = (tagId) => {
    dispatch(deleteProjectTag({ _id: tagId }));
    setIsAlertOpen(false);
  }

  const onStartDelete = (id) => {
    setTagToDelete(id);
    setIsAlertOpen(true);
  }

  const onCancelDelete = () => {
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
        { tags.map(({ _id, name, color }) => (
          <EditableTag 
            key={Math.random()}
            id={_id}
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
        tag={tags.find((tag) => tag._id === tagToDelete)} 
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
