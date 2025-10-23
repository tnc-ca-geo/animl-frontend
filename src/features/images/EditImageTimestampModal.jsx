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
});

const EditImageTimestampModal = ({ handleClose, image }) => {

  // Parse current date/time for initial values
  // If we have an image with a dateTimeOriginal, use that; otherwise use current time
  const imageDate = image?.dateTimeOriginal ? new Date(image.dateTimeOriginal) : new Date();

  const initialValues = {
    applyTo: 'filtered',
    datetime: imageDate,
  };

  const handleSubmit = (values) => {
    console.log('Timestamp to apply:', values.datetime.toISOString());
    console.log('Apply to:', values.applyTo);
    console.log('Image ID:', image?._id);
    console.log('Image deployment:', image?.deploymentId);

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
            <HelperText>
              <p>
                Set the date and time of the selected image using the timestamp fields below.
              </p>
              <p>
                Select an option below to apply changes to all currently filtered images
                {image?.deploymentId && ', all images in the deployment,'} or to this single image.
              </p>
            </HelperText>

            <RadioGroup role="group">
              <RadioButton
                type="radio"
                name="applyTo"
                value="filtered"
                checked={values.applyTo === 'filtered'}
                onChange={() => setFieldValue('applyTo', 'filtered')}
              />
              <RadioLabel onClick={() => setFieldValue('applyTo', 'filtered')}>
                Edit the timestamp for all currently filtered images. The
                date and time for all filtered images will be shifted
                proportionally.
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
                    Edit the timestamp for all images within the same deployment. The
                    date and time for all images in the deployment will be shifted
                    proportionally.
                  </RadioLabel>
                </>
              )}

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
            </RadioGroup>

            <DateTimePicker
              datetime={values.datetime}
              onDateTimeChange={(newDateTime) => setFieldValue('datetime', newDateTime)}
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
