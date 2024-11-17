import { styled } from "../../theme/stitches.config";
import ManageLabelsModal from "./ManageLabelsModal";
import { ManageTagsModal } from "./ManageTagsModal/ManageTagsModal";

export const ManageLabelsAndTagsModal = ({
  tab = "labels"
}) => {
  return (
    <>
      { tab === "labels" &&
        <ManageLabelsModal />
      }
      { tab === "tags" &&
        <ManageTagsModal />
      }
    </>
  );
}

const TitleContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  gap: '$2',
});

const TabTitle = styled('div', {
  width: 'fit-content',
  padding: '$1 $3',
  borderRadius: '$2',
  transition: 'all 40ms linear',
  '&:hover': {
    background: '$gray4',
    cursor: 'pointer'
  },
  '&:focus': {
    background: '$gray4',
    color: '$blue500'
  },
  variants: {
    active: {
      true: {
        background: '$gray4',
      }
    }
  }
});

const ModalTitle = styled('div', {
  position: 'absolute',
  left: '$3',
  paddingTop: '$1',
  paddingBottom: '$1'
});

export const ManageLabelsAndTagsModalTitle = ({
  tab,
  setTab
}) => {
  return (
    <TitleContainer>
      <ModalTitle>{`Manage ${tab}`}</ModalTitle>
      <TabTitle 
        active={tab === "labels"} 
        onClick={() => setTab("labels")}
      >
        Labels
      </TabTitle>
      <TabTitle
        active={tab === "tags"}
        onClick={() => setTab("tags")}
      >
        Tags
      </TabTitle>
    </TitleContainer>
  );
}
