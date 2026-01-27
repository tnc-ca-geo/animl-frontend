import React from 'react';
import { styled } from '../../theme/stitches.config';
import ManageLabelsModal from './ManageLabelsModal';
import { ManageTagsModal } from './ManageTagsModal/ManageTagsModal';

export const ManageLabelsAndTagsModal = ({ tab = 'labels' }) => {
  return (
    <>
      {tab === 'labels' && <ManageLabelsModal />}
      {tab === 'tags' && <ManageTagsModal />}
    </>
  );
};

const TitleContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$2',
});

const TabTitle = styled('div', {
  width: 'fit-content',
  padding: '$1 $3',
  borderRadius: '$4',
  fontSize: '$3',
  transition: 'all 40ms linear',
  '&:hover': {
    background: '$gray4',
    cursor: 'pointer',
  },
  '&:focus': {
    background: '$gray4',
    color: '$blue500',
  },
  variants: {
    active: {
      true: {
        background: '$hiContrast',
        color: '$loContrast',
        '&:hover': {
          background: '$hiContrast',
          cursor: 'pointer',
        },
      },
    },
  },
});

const TagsVsLabelsContent = styled('div', {
  maxWidth: '300px',
});

export const TagsVsLabelsHelp = () => (
  <TagsVsLabelsContent>
    <p>
      <a
        href="https://docs.animl.camera/getting-started/structure-concepts-and-terminology#objects-and-labels"
        target="_blank"
        rel="noopener noreferrer"
      >
        Labels
      </a>{' '}
      are used to describe an Object <em>within</em> an image (e.g., “animal”, “rodent”,
      “sasquatch“) and can be applied by either AI or humans.
    </p>
    <p>
      <a
        href="https://docs.animl.camera/getting-started/structure-concepts-and-terminology#tags"
        target="_blank"
        rel="noopener noreferrer"
      >
        Tags
      </a>{' '}
      are used to annotate <em>the image as a whole</em> (e.g., “favorite”, “seen”, “predation
      event”), and can only be applied to an image by human reviewers.
    </p>
  </TagsVsLabelsContent>
);

export const ManageLabelsAndTagsModalSwitch = ({ tab, setTab }) => {
  return (
    <TitleContainer>
      <TabTitle active={tab === 'labels'} onClick={() => setTab('labels')}>
        Labels
      </TabTitle>
      <TabTitle active={tab === 'tags'} onClick={() => setTab('tags')}>
        Tags
      </TabTitle>
    </TitleContainer>
  );
};
