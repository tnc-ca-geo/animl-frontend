import React from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { registerCamera } from './wirelessCamerasSlice';
import SelectField from '../../components/SelectField';
import Button from '../../components/Button';
import {
  FormWrapper,
  FormSubheader,
  FieldRow,
  FormFieldWrapper,
  ButtonRow,
} from '../../components/Form';
import { SUPPORTED_WIRELESS_CAMS } from '../../config.js';
import InfoIcon from '../../components/InfoIcon';

// TODO: improve validation? Make sure cameraId is not already actively
// registered to current project
const registerCameraSchema = Yup.object().shape({
  cameraId: Yup.string().required('A camera ID is required'),
  make: Yup.object().shape({
    label: Yup.string().required(),
    value: Yup.string().required('An camera make is required'),
  }),
});

const RegisterCameraForm = () => {
  const makeOptions = SUPPORTED_WIRELESS_CAMS.map((m) => ({ value: m, label: m }));
  const dispatch = useDispatch();

  const handleRegisterCameraSubmit = (formVals) => {
    dispatch(registerCamera({ cameraId: formVals.cameraId, make: formVals.make.value }));
  };

  return (
    <div>
      <FormWrapper>
        <Formik
          initialValues={{
            cameraId: '',
            make: makeOptions[0],
          }}
          validationSchema={registerCameraSchema}
          onSubmit={(values) => handleRegisterCameraSubmit(values)}
        >
          {({ values, errors, touched, isValid, dirty, setFieldValue, setFieldTouched }) => (
            <Form>
              <FormSubheader css={{ display: 'flex', alignItems: 'center' }}>
                Register a wireless camera <InfoIcon tooltipContent={<RegisterCameraHelp />} />
              </FormSubheader>
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name="make"
                    label="Camera Make"
                    value={values.make}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    error={_.has(errors, 'make.value') && errors.make.value}
                    touched={touched.make}
                    options={makeOptions}
                    isSearchable={false}
                    menuPlacement="top"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <label htmlFor="cameraId">
                    {values.make.value === 'RidgeTec' ? 'IMEI Number' : 'Camera Serial Number'}
                  </label>
                  <Field name="cameraId" id="cameraId" />
                  {/*<ErrorMessage component={FormError} name='cameraId' />*/}
                </FormFieldWrapper>
              </FieldRow>
              <ButtonRow>
                <Button type="submit" size="large" disabled={!isValid || !dirty}>
                  Register Camera
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default RegisterCameraForm;

const RegisterCameraHelp = () => (
  <div style={{ maxWidth: '320px' }}>
    To integrate a new wireless camera, you first need to pair, or &quot;register&quot; it, with
    your Project.
  </div>
);
