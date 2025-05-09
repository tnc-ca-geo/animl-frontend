import React, { useState, useEffect } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FieldArray, Field } from 'formik';
import { StandAloneInput as Input } from '../../components/Form.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import ReactSlider from 'react-slider';
import Checkbox from '../../components/Checkbox.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';

const CategoryConfigFilter = styled('div', {
  display: 'flex',
  marginBottom: '$3',
  width: '300px',
});

const Table = styled('table', {
  borderSpacing: '0',
  borderCollapse: 'collapse',
  width: '100%',
  tableLayout: 'fixed',
  marginBottom: '15px',
  // borderBottom: '1px solid',
  // borderColor: '$border',
});

const TableHeadCell = styled('th', {
  color: '$textMedium',
  fontSize: '$2',
  fontWeight: '400',
  textTransform: 'uppercase',
  textAlign: 'left',
  verticalAlign: 'bottom',
  padding: '5px 15px',
  borderBottom: '1px solid',
  borderTop: '1px solid',
  borderColor: '$border',
});

const TableRow = styled('tr', {
  '&:nth-child(odd)': {
    backgroundColor: '$backgroundDark',
  },
});

const TableCell = styled('td', {
  color: '$textDark',
  fontSize: '$3',
  fontWeight: '400',
  padding: '5px 15px',
  // borderBottom: '1px solid',
  // borderColor: mauve.mauve11,
});

const DisabledCheckboxWrapper = styled(CheckboxWrapper, {
  padding: '0px',
  minWidth: '100px',

  label: {
    display: 'flex',
    marginBottom: '0px',
  },
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
  width: '100%',
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

export function fieldToSlider({ field, form: { isSubmitting }, disabled, ...props }) {
  return {
    ...props,
    ...field,
    disabled: isSubmitting || disabled,
    disabledStyles: disabled,
    value: props.value * 100,
  };
}

const DisabledCheckbox = (props) => {
  const handleCheckboxChange = () => {
    props.form.setFieldValue(props.field.name, !props.field.value);
  };
  return <Checkbox checked={!props.value} active={!props.value} onChange={handleCheckboxChange} />;
};

const DisabledBulkCheckbox = ({ form, filteredCategories }) => {
  const [bulkCheckboxState, setBulkCheckboxState] = useState('allSelected');
  useEffect(() => {
    if (filteredCategories.every((cat) => !cat[1].disabled)) {
      setBulkCheckboxState('allSelected');
    } else {
      setBulkCheckboxState('notAllSelected');
    }
  }, [filteredCategories]);

  const stateMap = {
    notAllSelected: {
      checked: false,
      active: false,
      indeterminate: false,
      label: 'select all filtered labels',
    },
    allSelected: {
      checked: true,
      active: true,
      indeterminate: false,
      label: 'unselect all filtered labels',
    },
  };

  const handleBulkCheckboxChange = () => {
    let newCategoryConfig = {};
    Object.entries(form.values.action.categoryConfig).forEach(([catName, config]) => {
      if (filteredCategories.some((cat) => cat[0] === catName)) {
        newCategoryConfig[catName] = {
          ...config,
          // if not all are selected, set "disabled" to false for all filtered categories
          // if all are selected, set "disabled" to true for all filtered categories
          disabled: bulkCheckboxState !== 'allSelected' ? false : true,
        };
      } else {
        newCategoryConfig[catName] = config;
      }
    });
    form.setFieldValue(`action.categoryConfig`, newCategoryConfig);
  };

  return (
    <>
      <Checkbox
        checked={stateMap[bulkCheckboxState].checked}
        active={stateMap[bulkCheckboxState].active}
        indeterminate={stateMap[bulkCheckboxState].indeterminate}
        onChange={handleBulkCheckboxChange}
      />
      <CheckboxLabel
        checked={stateMap[bulkCheckboxState].checked}
        active={stateMap[bulkCheckboxState].active}
        css={{ fontFamily: '$sourceSansPro', fontWeight: '$5' }}
      >
        {stateMap[bulkCheckboxState].label}
      </CheckboxLabel>
    </>
  );
};

const ConfidenceSlider = (props) => (
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

const BulkConfidenceSlider = () => {
  const [bulkConfidence, setBulkConfidence] = useState(0.5);
  console.log('bulkConfidence', bulkConfidence);
  return (
    <>
      <StyledSlider
        // {...fieldToSlider(props)}
        value={bulkConfidence * 100}
        step={5}
        renderTrack={Track}
        renderThumb={Thumb}
        onChange={(value) => {
          const decimalVal = value / 100;
          setBulkConfidence(decimalVal);
          // props.form.setFieldValue(props.field.name, decimalVal);
        }}
      />
      <ConfDisplay>{Math.round(bulkConfidence * 100)}%</ConfDisplay>
    </>
  );
};

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;
const Thumb = (props) => <StyledThumb {...props} />;

const CategoryConfigList = ({ values }) => {
  // filter categories
  const [categoryFilter, setCategoryFilter] = useState('');
  const filteredCategories = Object.entries(values.action.categoryConfig)
    .filter(([k]) => !(values.action.model.value.includes('megadetector') && k === 'empty')) // NOTE: manually hiding "empty" categories b/c it isn't a real category returned by MDv5
    .filter(([k]) => {
      if (categoryFilter) {
        return k.toLowerCase().includes(categoryFilter.toLowerCase());
      } else {
        return true;
      }
    });

  return (
    <div>
      <label htmlFor="event-label">Labels</label>
      <CategoryConfigFilter>
        <Input
          css={{ width: 320, height: 40, padding: '$0 $3', marginRight: '$3' }}
          placeholder="Filter labels..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
      </CategoryConfigFilter>
      <FieldArray name="categoryConfigs">
        <Table>
          <thead>
            <tr>
              <TableHeadCell css={{ width: '30%' }}>Label name</TableHeadCell>
              <TableHeadCell css={{ width: '45%' }}>Taxonomy</TableHeadCell>
              <TableHeadCell css={{ width: '25%' }}>Confidence threshold</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {/* bulk adjustment controls */}
            <TableRow
              css={{
                textTransform: 'uppercase',
                borderBottom: '1px solid $border',
              }}
            >
              <TableCell>
                <label style={{ marginBottom: '0px' }}>
                  <Field name={`action.categoryConfig`}>
                    {({ form }) => (
                      <DisabledBulkCheckbox form={form} filteredCategories={filteredCategories} />
                    )}
                  </Field>
                </label>
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <ConfThreshold>
                  <Field component={BulkConfidenceSlider} name={`action.categoryConfig`} />
                </ConfThreshold>
              </TableCell>
            </TableRow>
            {/* individual category controls */}
            {filteredCategories.map(([catName, config]) => (
              <TableRow key={catName}>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  {/* {v.taxonomy.map((taxonomy) => (
                      <div key={taxonomy}>{taxonomy}</div>
                    ))} */}
                  <i>
                    mammalia {'>'} primates {'>'} callitrichidae {'>'} saguinus {'>'} melanoleucus
                  </i>
                </TableCell>
                <TableCell>
                  <ConfThreshold>
                    <Field
                      component={ConfidenceSlider}
                      name={`action.categoryConfig.${catName}.confThreshold`}
                      value={config.confThreshold}
                      disabled={config.disabled}
                    />
                    <ConfDisplay disabled={config.disabled}>
                      {Math.round(config.confThreshold * 100)}%
                    </ConfDisplay>
                  </ConfThreshold>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </FieldArray>
    </div>
  );
};

export default CategoryConfigList;
