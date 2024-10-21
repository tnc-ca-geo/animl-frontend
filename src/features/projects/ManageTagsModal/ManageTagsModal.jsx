import { styled } from '../../../theme/stitches.config';
import { EditableTag } from './EditableTag';

const EditableTagsContainer = styled('div', {
  overflowY: 'scroll',
  padding: '3px' // so that the input boxes' shadow does get cutoff
})

export const ManageTagsModal = () => {
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

  return (
    <EditableTagsContainer>
      { tags.map(({ id, name, color }) => (
        <EditableTag 
          key={id}
          id={id}
          currentName={name}
          currentColor={color}
          allTagNames={tags.map((tag) => tag.name)}
          onConfirmEdit={onConfirmEdit}
        />
      ))}
    </EditableTagsContainer>
  );
}
