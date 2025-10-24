import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import DateTimePicker from '../../components/DateTimePicker.jsx';

const RadioGroup = styled('div', {
  display: 'grid',
  gridTemplateColumns: '20px 1fr',
  columnGap: '12px',
  rowGap: '16px',
  marginBottom: '$5',
  width: '100%',
});

const RadioButton = styled('input', {
  margin: 0,
  marginTop: '3px',
  cursor: 'pointer',
  justifySelf: 'start',
});

const RadioLabel = styled('span', {
  color: '$textMedium',
  fontSize: '$3',
  lineHeight: '1.5',
  cursor: 'pointer',
});

const timestampSchema = Yup.object().shape({
  applyTo: Yup.string().required(),
  datetime: Yup.date().required('Date and time are required'),
  timezone: Yup.object().shape({
    value: Yup.string().required(),
    label: Yup.string().required(),
  }).required('Timezone is required'),
});

const EditImageTimestampModal = ({ handleClose, image, filters }) => {

  // Parse current date/time for initial values
  // If we have an image with a dateTimeOriginal, use that; otherwise use current time
  const imageDate = image?.dateTimeOriginal ? new Date(image.dateTimeOriginal) : new Date();

  // Default timezone - use image timezone if available, otherwise UTC
  const defaultTz = image?.timezone || 'UTC';

  const initialValues = {
    applyTo: 'single',
    datetime: imageDate,
    timezone: { value: defaultTz, label: defaultTz },
  };

  const handleSubmit = (values) => {
    console.log('Timestamp to apply:', values.datetime.toISOString());
    console.log('Timezone:', values.timezone.value);
    console.log('Apply to:', values.applyTo);

    if (values.applyTo === 'filtered') {
      console.log('Current filters:', filters);
    } else if (values.applyTo === 'deployment') {
      console.log('Deployment ID:', image?.deploymentId);
    } else if (values.applyTo === 'single') {
      console.log('Image ID:', image?._id);
    }

    // TODO: Dispatch action to update image timestamp(s)
    // This would typically dispatch a Redux action or call an API

    handleClose();
  };

  return (
    <FormWrapper>
      <Formik
        initialValues={initialValues}
        validationSchema={timestampSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isValid }) => (
          <Form>
            <HelperText css={{ padding: 0, marginBottom: '$3' }}>
              <p>
                Set the date and time of the selected image or collection of images selected below.
                Applying this change to a collection will shift timestamps by a proportional offset.
              </p>
            </HelperText>

            <RadioGroup role="group">
              <RadioButton
                type="radio"
                name="applyTo"
                value="single"
                checked={values.applyTo === 'single'}
                onChange={() => setFieldValue('applyTo', 'single')}
              />
              <RadioLabel onClick={() => setFieldValue('applyTo', 'single')}>
                Edit the timestamp for this image only
              </RadioLabel>

              {image?.deploymentId && (
                <>
                  <RadioButton
                    type="radio"
                    name="applyTo"
                    value="deployment"
                    checked={values.applyTo === 'deployment'}
                    onChange={() => setFieldValue('applyTo', 'deployment')}
                  />
                  <RadioLabel onClick={() => setFieldValue('applyTo', 'deployment')}>
                    Edit the timestamp for all images within the same deployment
                  </RadioLabel>
                </>
              )}

              <RadioButton
                type="radio"
                name="applyTo"
                value="filtered"
                checked={values.applyTo === 'filtered'}
                onChange={() => setFieldValue('applyTo', 'filtered')}
              />
              <RadioLabel onClick={() => setFieldValue('applyTo', 'filtered')}>
                Edit the timestamp for all currently filtered images
              </RadioLabel>
            </RadioGroup>

            <DateTimePicker
              datetime={values.datetime}
              timezone={values.timezone}
              onDateTimeChange={(newDateTime) => setFieldValue('datetime', newDateTime)}
              onTimezoneChange={(newTimezone) => setFieldValue('timezone', newTimezone)}
            />

            <ButtonRow>
              <Button
                type="button"
                size="large"
                onClick={handleClose}
                css={{
                  backgroundColor: 'transparent',
                  color: '$textMedium',
                  border: '1px solid $border',
                  '&:hover': {
                    backgroundColor: '$gray3',
                    color: '$textDark',
                  },
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="large" disabled={!isValid}>
                Save changes
              </Button>
            </ButtonRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default EditImageTimestampModal;
