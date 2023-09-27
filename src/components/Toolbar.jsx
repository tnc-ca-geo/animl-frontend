import { styled } from '../theme/stitches.config.js';
import * as Toolbar from '@radix-ui/react-toolbar';
import { violet, blackA, mauve } from '@radix-ui/colors';

export const ToolbarRoot = styled(Toolbar.Root, {
  display: 'flex',
  padding: 10,
  width: '100%',
  minWidth: 'max-content',
  borderRadius: 6,
  backgroundColor: 'white',
  boxShadow: `0 2px 10px ${blackA.blackA7}`,
});

export const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: mauve.mauve11,
  height: 25,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  fontSize: 13,
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': { backgroundColor: violet.violet3, color: violet.violet11 },
  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px ${violet.violet7}` },
};

export const ToolbarToggleItem = styled(Toolbar.ToggleItem, {
  ...itemStyles,
  backgroundColor: 'white',
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&[data-state=on]': { backgroundColor: violet.violet5, color: violet.violet11 },
});

export const ToolbarSeparator = styled(Toolbar.Separator, {
  width: 1,
  backgroundColor: mauve.mauve6,
  margin: '0 10px',
});

export const ToolbarLink = styled(
  Toolbar.Link,
  {
    ...itemStyles,
    backgroundColor: 'transparent',
    color: mauve.mauve11,
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  { '&:hover': { backgroundColor: 'transparent', cursor: 'pointer' } },
  { '@bp1': { display: 'inline-flex' } }
);

export const ToolbarButton = styled(
  Toolbar.Button,
  {
    ...itemStyles,
    paddingLeft: 10,
    paddingRight: 10,
    color: 'white',
    backgroundColor: violet.violet9,
  },
  { '&:hover': { backgroundColor: violet.violet10, color: 'white' } }
);
