import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import DateTimePicker from '../../components/DateTimePicker.jsx';
import {
  setTimestampOffsetTask,
  fetchTask,
  selectSetTimestampOffsetLoading,
} from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';

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

const EditImageTimestampModal = ({ handleClose, image }) => {
  const dispatch = useDispatch();
  const activeFilters = useSelector(selectActiveFilters);
  const setTimestampOffsetLoading = useSelector(selectSetTimestampOffsetLoading);
  const taskStartedRef = useRef(false);

  // Parse current date/time for initial values
  // Use adjusted datetime (resolver returns adjusted or falls back to original)
  const imageDate = image?.dateTimeAdjusted ? new Date(image.dateTimeAdjusted) : new Date();

  // Default timezone - use image timezone if available, otherwise UTC
  const defaultTz = image?.timezone || 'UTC';

  const initialValues = {
    applyTo: 'single',
    datetime: imageDate,
    timezone: { value: defaultTz, label: defaultTz },
  };

  // Track when task starts
  useEffect(() => {
    if (setTimestampOffsetLoading.isLoading && setTimestampOffsetLoading.taskId) {
      taskStartedRef.current = true;
    }
  }, [setTimestampOffsetLoading.isLoading, setTimestampOffsetLoading.taskId]);

  // Poll for task completion
  useEffect(() => {
    if (setTimestampOffsetLoading.isLoading && setTimestampOffsetLoading.taskId) {
      dispatch(fetchTask(setTimestampOffsetLoading.taskId));
    }
  }, [setTimestampOffsetLoading, dispatch]);

  // Close modal when task completes successfully
  useEffect(() => {
    if (
      taskStartedRef.current &&
      !setTimestampOffsetLoading.isLoading &&
      setTimestampOffsetLoading.taskId === null &&
      !setTimestampOffsetLoading.errors
    ) {
      handleClose();
    }
  }, [
    setTimestampOffsetLoading.isLoading,
    setTimestampOffsetLoading.taskId,
    setTimestampOffsetLoading.errors,
    handleClose,
  ]);

  const handleSubmit = (values) => {
    // Calculate offset in milliseconds
    // The offset is the difference between the new timestamp and the original image timestamp
    const originalTimestamp = new Date(image.dateTimeOriginal).getTime();
    const newTimestamp = values.datetime.getTime();
    const offsetMs = newTimestamp - originalTimestamp;

    if (values.applyTo === 'single') {
      // Apply to single image using batch task
      dispatch(
        setTimestampOffsetTask({
          imageIds: [image._id],
          filters: null,
          offsetMs,
        })
      );
    } else if (values.applyTo === 'deployment') {
      // Apply to all images in deployment using filter task
      const deploymentFilters = {
        ...activeFilters,
        deployments: [image.deploymentId],
      };
      dispatch(
        setTimestampOffsetTask({
          imageIds: [],
          filters: deploymentFilters,
          offsetMs,
        })
      );
    } else if (values.applyTo === 'filtered') {
      // Apply to all currently filtered images
      dispatch(
        setTimestampOffsetTask({
          imageIds: [],
          filters: activeFilters,
          offsetMs,
        })
      );
    }
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
              <Button
                type="submit"
                size="large"
                disabled={!isValid || setTimestampOffsetLoading.isLoading}
              >
                {setTimestampOffsetLoading.isLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </ButtonRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default EditImageTimestampModal;
