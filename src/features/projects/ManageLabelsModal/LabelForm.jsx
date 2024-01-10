import { Form, Field, useFormikContext } from 'formik';
import Button from "../../../components/Button";
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
              <Button
                type="button"
                aria-label="Get a new color"
                size="small"
                onClick={() => setFieldValue('color', `#${Math.floor(Math.random()*16777215).toString(16)}`)}
                css={{
                  backgroundColor: values.color,
                  borderColor: values.color
                }}
              >
                /\
              </Button>
              <Field name='color' id='color' />
            </ColorPicker>
            {!!errors.color && touched.color && (
              <FormError>
                {errors.color}
              </FormError>
            )}
          </FormFieldWrapper>
          <FormButtons>
            <Button size='small' type='submit'>Save</Button>
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
