import React from 'react';
import { styled } from '../../theme/stitches.config';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { Cross2Icon } from '@radix-ui/react-icons';
import Button from '../../components/Button.jsx';
import { violet, mauve } from '@radix-ui/colors';

export const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: mauve.mauve11,
  height: 30,
  padding: '0 5px',
  borderRadius: '0 4px 4px 0',
  display: 'flex',
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

const TagContainer = styled('div', {
  display: 'flex',
  border: '1px solid rgba(0,0,0,0)',
  borderRadius: 4,
  height: 32,
});

const TagName = styled('div', {
  padding: '$1 $3',
  color: '$textDark',
  fontFamily: '$mono',
  fontWeight: 'bold',
  fontSize: '$2',
  display: 'grid',
  placeItems: 'center',
  marginLeft: '0',
  marginRight: 'auto',
  height: 30,
  borderRadius: '4px 0 0 4px'
});

export const ImageTag = ({
  id,
  name,
  color,
  onDelete
}) => {
  return (
    <TagContainer css={{
      borderColor: color,
      backgroundColor: `${color}1A`,
    }}>
      <TagName>
        { name }
      </TagName>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarIconButton onClick={() => onDelete(id)}>
            <Cross2Icon />
          </ToolbarIconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Delete tag
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TagContainer>
  );
}
