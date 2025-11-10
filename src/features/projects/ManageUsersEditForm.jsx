import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import { styled } from '@stitches/react';

import { selectUsers, selectSelectedUser, updateUser, cancel } from './usersSlice.js';
import { FormWrapper, FormSubheader, FieldRow, ButtonRow } from '../../components/Form';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';
import Button from '../../components/Button';

const ManageUsersEditForm = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const selectedUser = useSelector(selectSelectedUser);

  const { username, roles } = users.find(({ username }) => selectedUser === username);

  // handle closing form
  useEffect(() => {
    return () => {
      dispatch(cancel());
    };
  }, [dispatch]);

  return (
    <FormWrapper>
      <Formik
        initialValues={{ username, roles }}
        onSubmit={(values) => dispatch(updateUser(values))}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <FormSubheader>Edit user: {username}</FormSubheader>
            <FieldRow>
              <Fieldset>
                <Legend>Project roles</Legend>
                <CheckboxRow>
                  <CheckboxWrapper>
                    <label>
                      <Checkbox
                        name="roles"
                        value="manager"
                        checked={values.roles.includes('manager')}
                        active={values.roles.includes('manager')}
                        onChange={({ target }) => {
                          const vals = target.checked
                            ? [...values.roles, 'manager']
                            : values.roles.filter((v) => v !== 'manager');
                          setFieldValue('roles', vals);
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
                        name="roles"
                        value="member"
                        checked={values.roles.includes('member')}
                        active={values.roles.includes('member')}
                        onChange={({ target }) => {
                          const vals = target.checked
                            ? [...values.roles, 'member']
                            : values.roles.filter((v) => v !== 'member');
                          setFieldValue('roles', vals);
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
                        name="roles"
                        value="observer"
                        checked={values.roles.includes('observer')}
                        active={values.roles.includes('observer')}
                        onChange={({ target }) => {
                          const vals = target.checked
                            ? [...values.roles, 'observer']
                            : values.roles.filter((v) => v !== 'observer');
                          setFieldValue('roles', vals);
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
              </Fieldset>
            </FieldRow>
            <ButtonRow>
              <Button type="button" size="large" onClick={() => dispatch(cancel())}>
                Cancel
              </Button>
              <Button type="submit" size="large">
                Update user
              </Button>
            </ButtonRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

const Fieldset = styled('fieldset', {
  border: 0,
  padding: 0,
  margin: 0,
});

const Legend = styled('legend', {
  fontWeight: 'bold',
  padding: 0,
});

const CheckboxRow = styled('div', {
  display: 'flex',
  gap: '$5',
});

export default ManageUsersEditForm;
