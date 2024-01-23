import { Form, Field, useFormikContext } from 'formik';
import Button from "../../../components/Button";
import IconButton from '../../../components/IconButton.jsx';
import { SymbolIcon } from '@radix-ui/react-icons';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../../components/Tooltip.jsx';
import {
  FormWrapper,
  FormFieldWrapper,
  FormError,
} from '../../../components/Form';
import {
  FormRow,
  FormButtons,
  ColorPicker
} from './components';
import { getRandomColor, getTextColor } from '../../../app/utils.js';

const LabelForm = ({ onCancel }) => {
  const { values, errors, touched, setFieldValue, resetForm } = useFormikContext();

  return (
    <FormWrapper>
      <Form>
        <FormRow>
          <FormFieldWrapper>
            <label htmlFor='name'>Name</label>
            <Field name='name' id='name' />
            {!!errors.name && touched.name && (
              <FormError>
                {errors.name}
              </FormError>
            )}
          </FormFieldWrapper>
          <FormFieldWrapper>
            <label htmlFor='name'>Color</label>
            <ColorPicker>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconButton
                    type="button"
                    aria-label="Get a new color"
                    size="md"
                    onClick={() => setFieldValue('color', `#${getRandomColor()}`)}
                    css={{
                      backgroundColor: values.color,
                      borderColor: values.color,
                      color: getTextColor(values.color),
                      '&:hover': {
                        borderColor: values.color,
                      }
                    }}
                  >
                    <SymbolIcon />
                  </IconButton>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5} >
                  Get a new color
                  <TooltipArrow />
                </TooltipContent>
              </Tooltip>
              <Field name='color' id='color' />
            </ColorPicker>
            {!!errors.color && touched.color && (
              <FormError>
                {errors.color}
              </FormError>
            )}
          </FormFieldWrapper>
          <FormButtons>
            <Button
              size='small'
              type='submit'
              disabled={!values.name}
            >
              Save
            </Button>
            <Button
              size='small'
              type='button'
              onClick={() => {
                resetForm();
                onCancel();
              }}
            >
              Cancel
            </Button>
          </FormButtons>
        </FormRow>
      </Form>
    </FormWrapper>
  );
}

export default LabelForm;
