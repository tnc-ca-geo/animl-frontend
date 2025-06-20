import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FieldArray, Field, FastField } from 'formik';
import { StandAloneInput as Input } from '../../components/Form.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import { SliderRoot, Track, Range, Thumb } from '../../components/Slider.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';
import { BulkUpdateConfidenceConfigAlert } from './BulkUpdateConfidenceConfigAlert.jsx';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { useTable, useFlexLayout, useResizeColumns } from 'react-table';
import useScrollbarSize from 'react-scrollbar-size';

const CategoryConfigFilter = styled('div', {
  display: 'flex',
  marginBottom: '$3',
  width: '450px',
});

const FilterCount = styled('div', {
  fontSize: '$3',
  width: '250px',
  fontFamily: '$Roboto',
  fontWeight: '$2',
  color: '$textMedium',
  display: 'flex',
  alignItems: 'center',
});

const BulkConfidenceLabel = styled('div', {
  fontSize: '$2',
  fontFamily: '$sourceSansPro',
  fontWeight: '$5',
  color: '$textDark',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  marginBottom: '0px',
  marginLeft: '0px',
  marginRight: '0px',
  padding: '0px',
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
  width: '100%',
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

const TableContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
});

const Table = styled('div', {
  height: '100%',
  maxWidth: '100%',
  display: 'inline-block',
  borderSpacing: '$0',
  backgroundColor: '$backgroundDark',
});

const TableRow = styled('div', {
  backgroundColor: '$backgroundLight',
  '&:hover': {
    backgroundColor: '$backgroundMedium',
    cursor: 'pointer',
  },
  '&:last-child': {
    '.td': {
      borderBottom: '0',
    },
  },
});

const TableCell = styled('div', {
  margin: '$0',
  padding: '$0',
  textAlign: 'left',
  // The secret sauce
  // Each cell should grow equally
  width: '1%',
  // But "collapsed" cells should be as small as possible
  '&.collapse': {
    width: '0.0000000001%',
  },
  borderRight: '0',
  '&:last-child': {
    borderRight: '0',
    paddingRight: '$3',
  },
  '&:first-child': {
    paddingLeft: '$3',
  },
});

const HeaderCell = styled(TableCell, {
  borderTop: '1px solid $border',
  borderBottom: '1px solid $border',
  textTransform: 'uppercase',
  color: '$textMedium',
  fontSize: '$2',
  '&:first-child': {
    paddingLeft: '0',
  },
  '&:last-child': {
    paddingRight: '0',
  },
});

const TableHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$backgroundLight',
  fontSize: '$2',
});

const HeaderLabel = styled('div', {
  borderBottom: '1px solid $border',
  paddingTop: '$1',
  paddingBottom: '$1',
});

const SubHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  height: '29px',
  backgroundColor: '$backgroundExtraDark',
  color: '$textDark',
  paddingTop: '$1',
  paddingBottom: '$1',
});

const DataCell = styled(TableCell, {
  margin: '0px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '$2',
  color: '$textDark',
  borderBottom: '1px solid $border',
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

const ConfidenceSlider = (props) => {
  const [confidence, setConfidence] = useState(props.value);
  return (
    <>
      <SliderRoot
        value={[confidence * 100]}
        max={100}
        step={5}
        disabled={props.disabled}
        onValueChange={(value) => {
          const decimalVal = value[0] / 100;
          setConfidence(decimalVal);
        }}
        onValueCommit={() => {
          props.form.setFieldValue(props.field.name, confidence);
        }}
      >
        <Track>
          <Range />
        </Track>
        <Thumb />
      </SliderRoot>
      <ConfDisplay disabled={props.disabled}>{Math.round(confidence * 100)}%</ConfDisplay>
    </>
  );
};

const BulkConfidenceSlider = ({ form, filteredCategories, defaultConf }) => {
  const [bulkConfidence, setBulkConfidence] = useState(defaultConf || 0.5);
  const [updateAlertOpen, setUpdateAlertOpen] = useState(false);

  return (
    <>
      <SliderRoot
        value={[bulkConfidence * 100]}
        max={100}
        step={5}
        onValueChange={(value) => {
          const decimalVal = value[0] / 100;
          setBulkConfidence(decimalVal);
        }}
        onValueCommit={() => {
          setUpdateAlertOpen(true);
        }}
      >
        <Track>
          <Range />
        </Track>
        <Thumb />
      </SliderRoot>
      <ConfDisplay>{Math.round(bulkConfidence * 100)}%</ConfDisplay>
      <BulkUpdateConfidenceConfigAlert
        isOpen={updateAlertOpen}
        onUpdateCancel={() => {
          setBulkConfidence(defaultConf || 0.5);
          setUpdateAlertOpen(false);
        }}
        onUpdateConfirm={() => {
          let newCategoryConfig = {};
          Object.entries(form.values.action.categoryConfig).forEach(([catName, config]) => {
            if (filteredCategories.some((cat) => cat[0] === catName)) {
              newCategoryConfig[catName] = {
                ...config,
                confThreshold: bulkConfidence,
              };
            } else {
              newCategoryConfig[catName] = config;
            }
          });
          form.setFieldValue(`action.categoryConfig`, newCategoryConfig);
          setUpdateAlertOpen(false);
        }}
      />
    </>
  );
};

const Taxonomy = ({ catName, config }) => {
  const taxon = config.taxonomy.split(';').filter((t) => t !== '');
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {taxon.length > 0 &&
        taxon.map((t, i) => (
          <div key={`${catName}-${i}`}>
            <span style={{ fontStyle: 'italic', padding: '0px 5px' }}>{t}</span>
            {i + 1 !== taxon.length && <span>{'>'}</span>}
          </div>
        ))}
    </div>
  );
};

const CategoryConfigList = ({ selectedModel, values }) => {
  const scrollBarSize = useScrollbarSize();
  const [categoryFilter, setCategoryFilter] = useState('');

  // enrich categories with taxonomy
  const enrichedCategories = useMemo(() => {
    console.log('1. form values changed, so enriching categories');
    return Object.entries(values.action.categoryConfig).map(([k, v]) => {
      const category = selectedModel.categories.find((cat) => cat.name === k);
      return [
        k,
        {
          ...v,
          taxonomy: category ? category.taxonomy : undefined,
        },
      ];
    });
  }, [selectedModel, values.action.categoryConfig]);

  // filter categories based on categoryFilter
  const filteredCategories = useMemo(() => {
    console.log('2. enriched categories changed, so filtering categories');
    return enrichedCategories
      .filter(
        ([k]) =>
          // NOTE: manually hiding "empty" categories b/c it isn't a real category returned by Megadetector
          !(
            (selectedModel._id.includes('megadetector') ||
              selectedModel._id.includes('speciesnet')) &&
            k === 'empty'
          ),
      )
      .filter(([k, v]) => {
        if (categoryFilter) {
          return (
            k.toLowerCase().includes(categoryFilter.toLowerCase()) ||
            (v.taxonomy && v.taxonomy.toLowerCase().includes(categoryFilter.toLowerCase()))
          );
        } else {
          return true;
        }
      });
  }, [enrichedCategories, categoryFilter]);

  const data = useMemo(() => {
    console.log('3. filtered categories changed, so building table data');
    return filteredCategories.map(([catName, config]) => {
      // category checkbox column
      const categoryCheckbox = (
        <DisabledCheckboxWrapper>
          <label>
            <FastField
              component={DisabledCheckbox}
              name={`action.categoryConfig.${catName}.disabled`}
              value={config.disabled}
            />
            <CategoryName checked={!config.disabled} active={!config.disabled}>
              {catName}
            </CategoryName>
          </label>
        </DisabledCheckboxWrapper>
      );

      // taxonomy column
      const taxonomy = config.taxonomy && <Taxonomy catName={catName} config={config} />;

      // confidence slider column
      const confidenceSlider = (
        <ConfThreshold>
          <FastField
            component={ConfidenceSlider}
            name={`action.categoryConfig.${catName}.confThreshold`}
            value={config.confThreshold}
            disabled={config.disabled}
          />
        </ConfThreshold>
      );

      return {
        categoryCheckbox,
        taxonomy,
        confidenceSlider,
      };
    });
  }, [filteredCategories]);

  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 100, // width is used for both the flex-basis and flex-grow
      maxWidth: 500,
    }),
    [],
  );

  const columns = useMemo(
    () => [
      {
        Header: (
          <div style={{ width: '100%' }}>
            <HeaderLabel css={{ paddingLeft: '$3' }}>Label name</HeaderLabel>
            <SubHeader css={{ paddingLeft: '$3' }}>
              <label style={{ marginBottom: '0px' }}>
                <Field name={`action.categoryConfig`}>
                  {({ form }) => (
                    <DisabledBulkCheckbox form={form} filteredCategories={filteredCategories} />
                  )}
                </Field>
              </label>
            </SubHeader>
          </div>
        ),
        accessor: 'categoryCheckbox',
        width: '155',
      },
      {
        Header: (
          <div style={{ width: '100%' }}>
            <HeaderLabel>Taxonomy</HeaderLabel>
            <SubHeader css={{ justifyContent: 'end', paddingRight: '$3' }}>
              <BulkConfidenceLabel>Adjust all thresholds:</BulkConfidenceLabel>
            </SubHeader>
          </div>
        ),
        accessor: 'taxonomy',
        width: '260',
      },
      {
        Header: (
          <div style={{ width: '100%' }}>
            <HeaderLabel css={{ paddingRight: '$3' }}>Confidence threshold</HeaderLabel>
            <SubHeader css={{ paddingRight: '$3' }}>
              <ConfThreshold>
                <Field name={`action.categoryConfig`}>
                  {({ form }) => (
                    <BulkConfidenceSlider
                      key={selectedModel._id}
                      form={form}
                      filteredCategories={filteredCategories}
                      defaultConf={selectedModel.defaultConfThreshold}
                    />
                  )}
                </Field>
              </ConfThreshold>
            </SubHeader>
          </div>
        ),
        accessor: 'confidenceSlider',
        disableSortBy: true,
        width: '150',
      },
    ],
    [filteredCategories],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn,
      manualSortBy: true,
      disableSortRemove: true,
    },
    useResizeColumns,
    useFlexLayout,
  );

  return (
    <div>
      <label htmlFor="event-label">Labels</label>
      <CategoryConfigFilter>
        <Input
          css={{ width: 320, height: 40, padding: '$0 $3', marginRight: '$3' }}
          placeholder="Filter labels by name or taxonomy..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <FilterCount>
          {filteredCategories.length} of {enrichedCategories.length} labels
        </FilterCount>
      </CategoryConfigFilter>
      <FieldArray name="categoryConfigs">
        <TableContainer>
          <Table {...getTableProps()}>
            <div style={{ width: `calc(100% - ${scrollBarSize.width}px)` }}>
              {headerGroups.map((headerGroup) => (
                <TableRow
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroup.getHeaderGroupProps().key}
                >
                  {headerGroup.headers.map((column) => (
                    <HeaderCell {...column.getHeaderProps()} key={column.id}>
                      <TableHeader>{column.render('Header')}</TableHeader>
                    </HeaderCell>
                  ))}
                </TableRow>
              ))}
            </div>
            <AutoSizer>
              {({ width }) => (
                <List
                  {...getTableBodyProps()}
                  height={800}
                  itemCount={rows.length}
                  itemSize={40}
                  width={width}
                  itemData={data}
                  overscanCount={6}
                  style={{ overflow: 'auto' }}
                >
                  {({ index, style }) => {
                    const row = rows[index];
                    prepareRow(row);
                    return (
                      <TableRow {...row.getRowProps({ style })}>
                        {row.cells.map((cell) => {
                          return (
                            <DataCell {...cell.getCellProps()} key={cell.getCellProps().key}>
                              {cell.render('Cell')}
                            </DataCell>
                          );
                        })}
                      </TableRow>
                    );
                  }}
                </List>
              )}
            </AutoSizer>
          </Table>
        </TableContainer>
      </FieldArray>
    </div>
  );
};

export default CategoryConfigList;
