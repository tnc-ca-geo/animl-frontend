import { styled } from '../../theme/stitches.config.js';
import { ToolbarRoot, ToolbarToggleItem, ToolbarSeparator, ToolbarLink, ToolbarButton } from '../../components/Toolbar.jsx';
import { ToggleGroup } from '@radix-ui/react-toolbar';
import {
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
    <ToggleGroup type="multiple" aria-label="Text formatting">
      <ToolbarToggleItem value="bold" aria-label="Bold">
        <FontBoldIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="italic" aria-label="Italic">
        <FontItalicIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="strikethrough" aria-label="Strike through">
        <StrikethroughIcon />
      </ToolbarToggleItem>
    </ToggleGroup>
    <ToolbarSeparator />
    <ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
      <ToolbarToggleItem value="left" aria-label="Left aligned">
        <TextAlignLeftIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="center" aria-label="Center aligned">
        <TextAlignCenterIcon />
      </ToolbarToggleItem>
      <ToolbarToggleItem value="right" aria-label="Right aligned">
        <TextAlignRightIcon />
      </ToolbarToggleItem>
    </ToggleGroup>
    <ToolbarSeparator />
    <ToolbarLink href="#" target="_blank" css={{ marginRight: 10 }}>
      Edited 2 hours ago
    </ToolbarLink>
    <ToolbarButton css={{ marginLeft: 'auto' }}>Share</ToolbarButton>
  </StyledToolbarRoot>
);

export default ImageReviewToolbar;