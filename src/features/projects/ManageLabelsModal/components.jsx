import { styled } from "../../../theme/stitches.config";
import { ButtonRow } from '../../../components/Form';

export const LabelList = styled('div', {
  overflowY: 'scroll',
  maxHeight: '500px'
});

export const LabelRow = styled('div', {
  marginBottom: '$3',
  paddingBottom: '$3',
  borderBottom: '1px solid $border'
});

export const LabelHeader = styled('div', {
  display: 'flex',
  marginBottom: '$2',
  alignItems: 'baseline'
});

export const LabelActions = styled(ButtonRow, {
  flex: '1',
  textAlign: 'right',
  paddingTop: 0,
  paddingBottom: 0
});

export const FormRow = styled('div', {
  display: 'flex',
  alignItems: 'flex-end'
});

export const FormButtons = styled(ButtonRow, {
  marginLeft: '$3',
});

export const ColorPicker = styled('div', {
  display: 'flex',
  gap: '$1',
  alignItems: 'center'
});
