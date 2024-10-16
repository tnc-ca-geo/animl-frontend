import { styled } from "../../theme/stitches.config";
import { Pencil1Icon } from "@radix-ui/react-icons";
import Button from "../../components/Button";
import { 
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger
} from "../../components/Tooltip";
import CategorySelector from "../../components/CategorySelector";
import { violet, mauve, indigo } from '@radix-ui/colors';
import { ImageTag } from "./ImageTag";

export const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: mauve.mauve11,
  height: 32,
  padding: '0 5px',
  borderRadius: 4,
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
  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px ${violet.violet7}` },
};

const ToolbarIconButton = styled(Button, {
  ...itemStyles,
  backgroundColor: 'white',
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

const TagsBar = styled('div', {
  display: 'flex',
  padding: '$2',
  width: '100%',
  borderBottom: '1px solid $border',
  gap: '$3',
  height: '49px',
});

const Separator = styled('div', {
  width: '1px',
  backgroundColor: mauve.mauve6,
  margin: '0 10px',
});

const ScrollContainer = styled('div', {
  display: 'flex',
  gap: '$2',
  flex: '1',
  overflowX: 'scroll'
});

export const ImageTagsBar = () => {
  return (
    <TagsBar>
      <Tooltip>
        <TooltipTrigger asChild>
          {true ? (
            <CategorySelector handleCategoryChange={() => console.log("change")} />
          ) : (
              <ToolbarIconButton
                onClick={() => {}}
                disabled={() => {}}
              >
                <Pencil1Icon />
              </ToolbarIconButton>
            )}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Edit all tags
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
      <Separator />
      <ScrollContainer>
        { [...Array(5)].map(() => (
          <ImageTag 
            tagName={"test tag"}
            value={true}
            onChangeTag={() => console.log("change tag")}
            onRemoveTag={() => console.log("remove tag")}
          />
        ))}
      </ScrollContainer>
    </TagsBar>
  );
}
