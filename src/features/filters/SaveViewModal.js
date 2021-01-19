import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';
import {
  selectSelectedView,
  selectActiveFilters,
  saveView,
  updateView,
} from '../filters/filtersSlice';

const StyledErrorMessage = styled(ErrorMessage, {
  color: '$warning',
})

const StyledField = styled.div({
  marginBottom: '$3',
});

// TODO: move a lot of this into a generic from component
const StyledForm = styled.div({
  display: 'block',
  width: '100%',
  label: {
    display: 'inherit',
    width: '100%',
    fontFamily: '$mono',
    fontSize: '$3',
    fontWeight: '$4',
    color: '$gray600',
  },
  input: {
    display: 'inherit',
    width: '100%',
    fontSize: '$4',
    color: '$hiContrast',
    padding: '$2',
    boxSizing: 'border-box',
  },
  textarea: {
    display: 'inherit',
    width: '100%',
    fontFamily: '$roboto',
    fontSize: '$4',
    color: '$hiContrast',
    padding: '$2',
    boxSizing: 'border-box',
  },
  button: {
    display: 'inherit',
    width: '100%',
    height: '$6',
    marginTop: '$3',
    border: '$1 $blue500 solid',
    backgroundColor: '$blue500',
    color: '$loContrast',
    ':hover': {
      backgroundColor: '$loContrast',
      color: '$blue500',
    }
  }
});

const SaveModeTab = styled(Button, {
  margin: '$0 $2',
  svg: {
    paddingRight: '$2'
  },
  ':hover': {
    backgroundColor: '$gray300',
    cursor: 'pointer',
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$blue200',
        borderColor: '$blue500',
        color: '$blue500',
        ':hover': {
          backgroundColor: '$blue200',
          cursor: 'default',
        },
      }
    }
  }
});

const SaveModeSelector = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '$3',
});

const ViewName = styled.span({
  fontWeight: '$5',
})

const Row = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

const SaveViewModalBody = styled.div({
  // display: 'flex',
  // justifyContent: 'center',
  margin: '$3',
});

const SaveViewModalHeader = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$0 $3',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  fontWeight: '$5',
});

const newViewSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('A name is required'),
  description: Yup.string()
    .min(2, 'Too Short!')
    .max(500, 'Too Long!'),
});

const SaveViewModal = ({ handleClose }) => {
  const [saveMode, setSaveMode] = useState();
  const [isEditable, setIsEditable] = useState(true);
  const selectedView = useSelector(selectSelectedView);
  const activeFilters = useSelector(selectActiveFilters);
  const dispatch = useDispatch();

  useEffect(() => {
    // TODO: implement 'isEditable' feild for views 
    // (and set 'All Images' to false)
    setIsEditable(true)
  }, [selectedView])

  const handleSaveModeSelection = (mode) => {
    setSaveMode(mode);
  };

  // const handleUpdateViewSubmit = (_id, filters) => {
  //   console.log('update-curr form with filters: ', filters);
  //   const payload = {
  //     _id: _id,
  //     diffs: {
  //       filters: filters,
  //     }
  //   };
  //   dispatch(updateView(payload));
  //   handleClose();
  // }

  // const handleCreateViewSubmit = (values) => {
  //   console.log('create-new form values: ', values);
  //   dispatch(saveView(values));
  //   handleClose();  // TODO: show loading & wait for success to close
  // };

  const handleSaveViewSubmit = (mode, selectedView, formVals) => {
    console.log('mode: ', mode)
    const payload = (mode === 'update-curr')
      ? {
          _id: selectedView._id,
          diffs: {
            filters: formVals.filters,
          }
        }
      : formVals;
    console.log('payload: ', payload)

    dispatch(saveView({ mode, payload }));
    handleClose();  // TODO: show loading & wait for success to close
  }

  return (
    <Modal size='sm'>
      <SaveViewModalHeader>
        Save view
        <IconButton
          variant='ghost'
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={['fas', 'times']} />
        </IconButton>
      </SaveViewModalHeader>
      <SaveViewModalBody>
        <SaveModeSelector>
          <SaveModeTab
            size='large'
            disabled={!isEditable}
            active={saveMode === 'update-curr' ? true : false}
            onClick={() => handleSaveModeSelection('update-curr')}
          >
            <FontAwesomeIcon icon={['fas', 'edit']} />
            Update current view
          </SaveModeTab>
          <SaveModeTab
            size='large'
            active={saveMode === 'create-new' ? 'true' : 'false'}
            onClick={() => handleSaveModeSelection('create-new')}
          >
            <FontAwesomeIcon icon={['fas', 'plus']} />
            Create new view
          </SaveModeTab>
        </SaveModeSelector>
        <Row>
          {(saveMode === 'update-curr') &&
            <StyledForm>
              <p>
                Are you sure you'd like to overwrite 
                the filters for the 
                <ViewName>{selectedView.name}</ViewName> view?
              </p>
              <Formik
                initialValues={{ filters: activeFilters }}
                onSubmit={(values) => {
                  handleSaveViewSubmit(saveMode, selectedView, values);
                }}
              >
                {({ errors, touched }) => (
                  <Form>
                    <Field
                      name='filters'
                      type='hidden'
                    />
                    <Button type='submit'>
                      Save view
                    </Button>
                  </Form>
                )}
              </Formik>
            </StyledForm>
          }
          {(saveMode === 'create-new') &&
            <StyledForm>
              <Formik
                initialValues={{
                  name: '',
                  description: '',
                  filters: activeFilters,
                }}
                validationSchema={newViewSchema}
                onSubmit={(values) => {
                  handleSaveViewSubmit(saveMode, selectedView, values);
                }}              >
                {({ errors, touched, isValid, dirty }) => (
                  <Form>
                    <StyledField>
                      <label htmlFor='name'>Name</label>
                      <Field
                        name='name'
                        id='name'
                      />
                      <StyledErrorMessage name='name' />
                    </StyledField>
                    <StyledField>
                      <label htmlFor='description'>Description</label>
                      <Field
                        name='description'
                        id='description'
                        component='textarea'
                      />
                      <StyledErrorMessage name='description' />
                    </StyledField>
                    <Field
                      name='filters'
                      type='hidden'
                    />
                    <Button 
                      type='submit'
                      disabled={!isValid || !dirty}
                    >
                      Save view
                    </Button>
                  </Form>
                )}
              </Formik>
            </StyledForm>
          }
        </Row>
      </SaveViewModalBody>
    </Modal>
  );
};

export default SaveViewModal;

