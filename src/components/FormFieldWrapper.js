import { styled } from '../theme/stitches.config.js';

const FormFieldWrapper = styled.div({
  flexGrow: '1',
  marginBottom: '$3',
  marginLeft: '$3',
  ':first-child': {
    marginLeft: '0',
  }
});

export default FormFieldWrapper;