import { styled } from '../../theme/stitches.config.js';
import { ToolbarRoot, ToolbarSeparator, ToolbarButton, ToolbarIconButton } from '../../components/Toolbar.jsx';
import {
  PlusIcon,
  ValueNoneIcon,
  CheckIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';

const StyledToolbarRoot = styled(ToolbarRoot, {
  marginTop: '$2'
})

const ImageReviewToolbar = ({
  handleValidateAllButtonClick,
  handleMarkEmptyButtonClick,
  handleAddObjectButtonClick
}) => {
  return (
    <StyledToolbarRoot aria-label="Formatting options">
      <ToolbarIconButton onClick={(e) => handleValidateAllButtonClick(e, true)}>
        <CheckIcon /> Validate
      </ToolbarIconButton>
      <ToolbarSeparator />
      <ToolbarIconButton onClick={(e) => handleValidateAllButtonClick(e, false)}>
        <Cross2Icon /> Invalidate
      </ToolbarIconButton>
      <ToolbarSeparator />
      <ToolbarIconButton onClick={handleMarkEmptyButtonClick}>
        <ValueNoneIcon /> Mark empty
      </ToolbarIconButton>
      <ToolbarSeparator />
      <ToolbarIconButton onClick={handleAddObjectButtonClick}>
        <PlusIcon /> Add object
      </ToolbarIconButton>
      {/* <ToolbarButton css={{ marginLeft: 'auto' }}>Share</ToolbarButton> */}
    </StyledToolbarRoot>
  );
};

export default ImageReviewToolbar;