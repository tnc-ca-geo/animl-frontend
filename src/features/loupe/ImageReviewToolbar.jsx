import { styled } from '../../theme/stitches.config.js';
import { ToolbarRoot, ToolbarToggleItem, ToolbarSeparator, ToolbarLink, ToolbarButton, ToolbarIconButton } from '../../components/Toolbar.jsx';
import { ToggleGroup } from '@radix-ui/react-toolbar';
import {
  PlusIcon,
  ValueNoneIcon,
  CheckIcon,
  Cross2Icon,
  StrikethroughIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  FontBoldIcon,
  FontItalicIcon,
} from '@radix-ui/react-icons';

const StyledToolbarRoot = styled(ToolbarRoot, {
  marginTop: '$2'
})

const ImageReviewToolbar = () => (
  <StyledToolbarRoot aria-label="Formatting options">
    <ToolbarIconButton>
      <CheckIcon /> Validate
    </ToolbarIconButton>
    <ToolbarSeparator />
    <ToolbarIconButton>
      <Cross2Icon /> Invalidate
    </ToolbarIconButton>
    <ToolbarSeparator />
    <ToolbarIconButton>
      <ValueNoneIcon /> Mark empty
    </ToolbarIconButton>
    <ToolbarSeparator />
    <ToolbarIconButton>
      <PlusIcon /> Add object
    </ToolbarIconButton>
    {/* <ToolbarButton css={{ marginLeft: 'auto' }}>Share</ToolbarButton> */}
  </StyledToolbarRoot>
);

export default ImageReviewToolbar;