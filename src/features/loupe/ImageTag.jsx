import { styled } from "../../theme/stitches.config";
import { violet, mauve, indigo } from '@radix-ui/colors';
import Button from "../../components/Button";
import { 
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger
} from "../../components/Tooltip";
import { Cross2Icon } from "@radix-ui/react-icons";

const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: mauve.mauve11,
  height: '100%',
  padding: '0 5px',
  borderRadius: '0 4px 4px 0',
  display: 'inline-flex',
  fontSize: 13,
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: violet.violet3,
    color: violet.violet11,
    cursor: 'pointer',
  },
};

const ToolbarIconButton = styled(Button, {
  ...itemStyles,
  backgroundColor: violet.violet2,
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&[data-state=on]': {
    backgroundColor: violet.violet5,
    color: violet.violet11,
  },
  svg: {
    marginRight: '$1',
    marginLeft: '$1',
  },
});

const Tag = styled('div', {
  display: 'flex',
  borderRadius: '$2',
  border: '1px solid indigo',
  background: 'rgba(0, 162, 199, 0.1)',
  fontSize: '$2',
  fontWeight: '$5',
  overflow: 'hidden',
  height: 32
});

const TagName = styled('div', {
  display: 'grid',
  placeItems: 'center',
  padding: '$1 $2'
});

export const ImageTag = ({
  tagName,
  value,
  onChangeTag,
  onRemoveTag,
}) => {
  return (
    <Tag>
      <TagName>{ tagName }</TagName>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarIconButton
            onClick={() => console.log("click")}
            disabled={false}
          >
            <Cross2Icon />
          </ToolbarIconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Remove tag
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </Tag>
  );
}
