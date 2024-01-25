import { styled } from "../../../theme/stitches.config";
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Field name='color' id='color' />
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  sideOffset={5}
                  css={{ 
                    maxWidth: 296,
                    padding: '$2',
                    color: '$textMedium',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ paddingBottom: '3px' }}>Choose from default colors:</div>
                  {defaultColors.map((color) => (
                    <ColorSwatch 
                      key={color}
                      css={{ backgroundColor: color }}
                      type='button'
                      onClick={() => setFieldValue('color', `${color}`)}
                    />
                  ))}
                  <TooltipArrow css={{ fill: 'white' }}/>
                </TooltipContent>
              </Tooltip>
          
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
};

const defaultColors = [
  '#E54D2E', '#E5484D', '#E93D82', '#D6409F', '#AB4ABA', 
  '#8E4EC6', '#6E56CF', '#5B5BD6', '#3E63DD', '#0090FF',
  '#00A2C7', '#12A594', '#30A46C', '#46A758', '#A18072',
  '#F76B15', '#FFC53D', '#FFE629', '#BDEE63', '#7CE2FE'
];

const ColorSwatch = styled('button', {
  border: 'none',
  color: '$backgroundLight',
  height: '$4',
  width: '$4',
  margin: 2,
  borderRadius: '$2'
});

export default LabelForm;
