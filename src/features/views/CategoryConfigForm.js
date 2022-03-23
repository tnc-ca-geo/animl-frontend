import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { Field } from 'formik';
import ReactSlider from 'react-slider';
import { FieldRow } from '../../components/Form';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';

const StyledFieldRow = styled(FieldRow, {
  paddingTop: '$2',
});

const CategoryName = styled(CheckboxLabel, {
  fontSize: '$3',
  fontFamily: '$Roboto',
  fontWeight: '$2',
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
          backgroundColor: '$gray400',
        },
        '.thumb': {
          backgroundColor: '$gray400',
          cursor: 'default',
        }
      }
    }
  }
});

const StyledThumb = styled('div', {
  top: '-8px',
  height: '12px',
  width: '12px',
  textAlign: 'center',
  backgroundColor: '$hiContrast',
  color: '$loContrast',
  border: '3px solid white',
  borderRadius: '50%',
  cursor: 'grab',
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
        color: '$gray400',
      }
    }
  }
});

const DisabledCheckboxWrapper = styled(CheckboxWrapper, {
  padding: '0px',
  minWidth: '100px',

  'label': {
    marginBottom: '0px',
  }
});

export function fieldToSlider({
  field,
  form: { isSubmitting, setFieldValue },
  disabled,
  ...props
}) {
  return {
    ...props,
    ...field,
    disabled: isSubmitting || disabled,
    disabledStyles: disabled,
    value: props.value * 100,
  };
};

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

  return (
    <Checkbox
      checked={!props.value}
      active={!props.value}
      onChange={handleCheckboxChange}
    />
  )
};

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;
const Thumb = (props, state) => <StyledThumb {...props} />;

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
          { Math.round(config.confThreshold * 100) }%
        </ConfDisplay>
      </ConfThreshold>
    </StyledFieldRow>
  );
};

export default CategoryConfigForm;