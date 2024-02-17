import { styled } from "../../../theme/stitches.config";
import { ButtonRow } from '../../../components/Form';

export const LabelList = styled('div', {
  overflowY: 'auto',
  maxHeight: '500px'
});

export const LabelRow = styled('div', {
  paddingTop: '$2',
  borderBottom: '1px solid $border'
});

export const LabelHeader = styled('div', {
  display: 'flex',
  marginBottom: '$2',
  alignItems: 'center'
});

export const LabelActions = styled(ButtonRow, {
  flex: '1',
  textAlign: 'right',
  paddingTop: 0,
  paddingBottom: 0
});

export const FormRow = styled('div', {
  display: 'flex',
  alignItems: 'flex-start'
});

export const FormButtons = styled(ButtonRow, {
  marginLeft: '$3',
  marginTop: '$4'
});

export const ColorPicker = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'center'
});
