import { useDispatch } from "react-redux";
import { Formik, Form, Field } from 'formik';
import { styled } from "@stitches/react";
import * as Yup from 'yup';

import { createUser } from './userSlice.js';
import {
  FormWrapper,
  FormSubheader,
  FieldRow,
  FormFieldWrapper,
  FormError,
  ButtonRow,
} from '../../components/Form';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';
import Button from '../../components/Button';

const createUserSchema = Yup.object().shape({
  username: Yup.string().email('Enter an email address').required('Enter the user\'s email address.'),
  roles: Yup.array().min(1, 'Select at least one role').required('Select at least one role')
});

const ManageUsersAddForm = () => {
  const dispatch = useDispatch();

  return (
    <FormWrapper>
      <Formik
        initialValues={{ username: '', roles: [] }}
        validationSchema={createUserSchema}
        onSubmit={(values) => dispatch(createUser(values))}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <FormSubheader>
              Add user
            </FormSubheader>

            <FieldRow>
              <FormFieldWrapper>
                <label htmlFor='username'>E-Mail</label>
                <Field type='email' name='username' id='username' />
                {!!errors.username && touched.username && (
                  <FormError>
                    {errors.username}
                  </FormError>
                )}
              </FormFieldWrapper>
            </FieldRow>
            <FieldRow>
              <FormFieldWrapper>
                <Fieldset>
                  <Legend>Project roles</Legend>
                  <CheckboxRow>
                    <CheckboxWrapper>
                      <label>
                        <Checkbox
                          name='roles'
                          value='manager'
                          checked={values.roles.includes('manager')}
                          active={values.roles.includes('manager')}
                          onChange={({ target }) => {
                            const vals = target.checked ?
                              [...values.roles, 'manager'] :
                              values.roles.filter(v => v !== 'manager')
                            setFieldValue('roles', vals)
                          }}
                        />
                        <CheckboxLabel
                          checked={values.roles.includes('member')}
                          active={values.roles.includes('member')}
                        >
                          Manager
                        </CheckboxLabel>
                      </label>
                    </CheckboxWrapper>
                    <CheckboxWrapper>
                      <label>
                        <Checkbox
                          name='roles'
                          value='member'
                          checked={values.roles.includes('member')}
                          active={values.roles.includes('member')}
                          onChange={({ target }) => {
                            const vals = target.checked
                              ? [...values.roles, 'member']
                              : values.roles.filter(v => v !== 'member')
                            setFieldValue('roles', vals)
                          }}
                        />
                        <CheckboxLabel
                          checked={values.roles.includes('member')}
                          active={values.roles.includes('member')}
                        >
                          Member
                        </CheckboxLabel>
                      </label>
                    </CheckboxWrapper>
                    <CheckboxWrapper>
                      <label>
                        <Checkbox
                          name='roles'
                          value='observer'
                          checked={values.roles.includes('observer')}
                          active={values.roles.includes('observer')}
                          onChange={({ target }) => {
                            const vals = target.checked ?
                              [...values.roles, 'observer'] :
                              values.roles.filter(v => v !== 'observer')
                            setFieldValue('roles', vals)
                          }}
                        />
                        <CheckboxLabel
                          checked={values.roles.includes('observer')}
                          active={values.roles.includes('observer')}
                        >
                          Observer
                        </CheckboxLabel>
                      </label>
                    </CheckboxWrapper>
                  </CheckboxRow>
                  {!!errors.roles && touched.roles && (
                    <FormError>
                      {errors.roles}
                    </FormError>
                  )}
                </Fieldset>
              </FormFieldWrapper>
            </FieldRow>
            <ButtonRow>
              <Button
                type='submit'
                size='large'
              >
                Add user
              </Button>
            </ButtonRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
}

const Fieldset = styled('fieldset', {
  border: 0,
  padding: 0,
  margin: 0
});

const Legend = styled('legend', {
  fontWeight: 'bold',
  padding: 0,
});

const CheckboxRow = styled('div', {
  display: 'flex',
  gap: '$5',
});

export default ManageUsersAddForm;
