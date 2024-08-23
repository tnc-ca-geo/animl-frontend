import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { Field } from 'formik';
import ReactSlider from 'react-slider';
import { FieldRow } from '../../components/Form.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';

const StyledFieldRow = styled(FieldRow, {
  paddingTop: '$2',
});

const CategoryName = styled(CheckboxLabel, {
  fontSize: '$3',
  fontFamily: '$Roboto',
  fontWeight: '$2',
  minWidth: '250px',
});

const ConfThreshold = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontSize: '$3',
  fontFamily: '$Roboto',
  fontWeight: '$2',
});

const StyledSlider = styled(ReactSlider, {
  height: '2px',
  minWidth: '200px',
  variants: {
    disabledStyles: {
      true: {
        '.track': {
          backgroundColor: '$gray4',
        },
        '.thumb': {
          backgroundColor: '$gray4',
          cursor: 'default',
        },
      },
    },
  },
});

const StyledThumb = styled('div', {
  top: '-5px',
  height: '12px',
  width: '12px',
  textAlign: 'center',
  backgroundColor: '$hiContrast',
  color: '$loContrast',
  border: '3px solid white',
  borderRadius: '50%',
  cursor: 'grab',
  zIndex: 0,
});

const StyledTrack = styled('div', {
  top: '0',
  bottom: '0',
  background: '#ddd',
  borderRadius: '999px',

  '&.track-0': {
    backgroundColor: '$hiContrast',
  },
});

const ConfDisplay = styled('div', {
  marginLeft: '$3',
  variants: {
    disabled: {
      true: {
        color: '$gray4',
      },
    },
  },
});

const DisabledCheckboxWrapper = styled(CheckboxWrapper, {
  padding: '0px',
  minWidth: '100px',

  label: {
    display: 'flex',
    marginBottom: '0px',
  },
});

export function fieldToSlider({ field, form: { isSubmitting }, disabled, ...props }) {
  return {
    ...props,
    ...field,
    disabled: isSubmitting || disabled,
    disabledStyles: disabled,
    value: props.value * 100,
  };
}

const Slider = (props) => (
  <StyledSlider
    {...fieldToSlider(props)}
    step={5}
    renderTrack={Track}
    renderThumb={Thumb}
    onChange={(value) => {
      const decimalVal = value / 100;
      props.form.setFieldValue(props.field.name, decimalVal);
    }}
  />
);

const DisabledCheckbox = (props) => {
  const handleCheckboxChange = () => {
    props.form.setFieldValue(props.field.name, !props.field.value);
  };
  return <Checkbox checked={!props.value} active={!props.value} onChange={handleCheckboxChange} />;
};

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;
const Thumb = (props) => <StyledThumb {...props} />;

const CategoryConfigForm = ({ catName, config }) => {
  return (
    <StyledFieldRow key={catName}>
      <DisabledCheckboxWrapper>
        <label>
          <Field
            component={DisabledCheckbox}
            name={`action.categoryConfig.${catName}.disabled`}
            value={config.disabled}
          />
          <CategoryName checked={!config.disabled} active={!config.disabled}>
            {catName}
          </CategoryName>
        </label>
      </DisabledCheckboxWrapper>
      <ConfThreshold>
        <div>
          <Field
            component={Slider}
            name={`action.categoryConfig.${catName}.confThreshold`}
            value={config.confThreshold}
            disabled={config.disabled}
          />
        </div>
        <ConfDisplay disabled={config.disabled}>
          {Math.round(config.confThreshold * 100)}%
        </ConfDisplay>
      </ConfThreshold>
    </StyledFieldRow>
  );
};

export default CategoryConfigForm;
