import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FieldArray, Field, FastField } from 'formik';
import { StandAloneInput as Input } from '../../components/Form.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import ReactSlider from 'react-slider';
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

// const Table = styled('table', {
//   borderSpacing: '0',
//   borderCollapse: 'collapse',
//   width: '100%',
//   tableLayout: 'fixed',
//   marginBottom: '15px',
//   // borderBottom: '1px solid',
//   // borderColor: '$border',
// });

// const TableHeadCell = styled('th', {
//   color: '$textMedium',
//   fontSize: '$2',
//   fontWeight: '400',
//   textTransform: 'uppercase',
//   textAlign: 'left',
//   verticalAlign: 'bottom',
//   padding: '5px 15px',
//   borderBottom: '1px solid',
//   borderTop: '1px solid',
//   borderColor: '$border',
// });

// const TableRow = styled('tr', {
//   '&:nth-child(odd)': {
//     backgroundColor: '$backgroundDark',
//   },
// });

// const TableCell = styled('td', {
//   color: '$textDark',
//   fontSize: '$3',
//   fontWeight: '400',
//   padding: '5px 15px',
//   // borderBottom: '1px solid',
//   // borderColor: mauve.mauve11,
// });

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

  variants: {
    selected: {
      true: {
        // 'zIndex': '2',
        // 'boxShadow': '0px 4px 14px 0px #0000003b',
      },
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

  console.log('bulkCheckboxState', bulkCheckboxState);
  useEffect(() => {
    console.log('filtered categories changed...');
    if (filteredCategories.every((cat) => !cat[1].disabled)) {
      console.log('all categories selected');
      setBulkCheckboxState('allSelected');
    } else {
      console.log('not all categories selected');
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
    console.log('handleBulkCheckboxChange');
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

const BulkConfidenceSlider = ({ form, filteredCategories }) => {
  const [bulkConfidence, setBulkConfidence] = useState(0.5);
  const [updateAlertOpen, setUpdateAlertOpen] = useState(false);

  return (
    <>
      <StyledSlider
        value={bulkConfidence * 100}
        step={5}
        renderTrack={Track}
        renderThumb={Thumb}
        onChange={(value) => {
          const decimalVal = value / 100;
          setBulkConfidence(decimalVal);
        }}
        onAfterChange={() => setUpdateAlertOpen(true)}
      />
      <ConfDisplay>{Math.round(bulkConfidence * 100)}%</ConfDisplay>
      <BulkUpdateConfidenceConfigAlert
        isOpen={updateAlertOpen}
        onUpdateCancel={() => setUpdateAlertOpen(false)}
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

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;
const Thumb = (props) => <StyledThumb {...props} />;

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

// const Row = ({ index, style }) => <div style={style}>Row {index}</div>;

const CategoryConfigList = ({ selectedModel, values }) => {
  const scrollBarSize = useScrollbarSize();
  // filter categories
  const [categoryFilter, setCategoryFilter] = useState('');

  const enrichedCategories = useMemo(() => {
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

  const filteredCategories = enrichedCategories
    .filter(([k]) => !(values.action.model.value.includes('megadetector') && k === 'empty')) // NOTE: manually hiding "empty" categories b/c it isn't a real category returned by MDv5
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

  const data = filteredCategories.map(([catName, config]) => {
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
        <ConfDisplay disabled={config.disabled}>
          {Math.round(config.confThreshold * 100)}%
        </ConfDisplay>
      </ConfThreshold>
    );

    return {
      categoryCheckbox,
      taxonomy,
      confidenceSlider,
    };
  });

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
              <Field name={`action.categoryConfig`}>
                {({ form }) => (
                  <DisabledBulkCheckbox form={form} filteredCategories={filteredCategories} />
                )}
              </Field>
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
            <HeaderLabel>Confidence threshold</HeaderLabel>
            <SubHeader>
              <ConfThreshold>
                <Field name={`action.categoryConfig`}>
                  {({ form }) => (
                    <BulkConfidenceSlider form={form} filteredCategories={filteredCategories} />
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
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // setHiddenColumns,
    // toggleHideAllColumns,
    // state: { sortBy },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      manualSortBy: true,
      disableSortRemove: true,
      // initialState,
    },
    useResizeColumns,
    useFlexLayout,
    // useSortBy,
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
        {/* <Table>
          <thead>
            <tr>
              <TableHeadCell css={{ width: '30%' }}>Label name</TableHeadCell>
              <TableHeadCell css={{ width: '45%' }}>Taxonomy</TableHeadCell>
              <TableHeadCell css={{ width: '25%' }}>Confidence threshold</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            <AutoSizer>
              {({ width, height }) => (
                <List
                  height={800}
                  itemCount={filteredCategories.length}
                  itemSize={40}
                  width={width}
                  itemData={filteredCategories}
                  overscanCount={6}
                  style={{ overflow: 'auto' }}
                >
                  {({ index, style, data }) => {
                    const [catName, config] = data[index];
                    return (
                      <TableRow key={catName} style={style}>
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
                          {config.taxonomy && <Taxonomy catName={catName} config={config} />}
                        </TableCell>
                        <TableCell>
                          <ConfThreshold>
                            <Field name={`action.categoryConfig`}>
                              {({ form }) => (
                                <BulkConfidenceSlider
                                  form={form}
                                  filteredCategories={filteredCategories}
                                />
                              )}
                            </Field>
                          </ConfThreshold>
                        </TableCell>
                      </TableRow>
                    );
                  }}
                </List>
              )}
            </AutoSizer>
          </tbody>
        </Table> */}

        {/* <Table>
          <thead>
            <tr>
              <TableHeadCell css={{ width: '30%' }}>Label name</TableHeadCell>
              <TableHeadCell css={{ width: '45%' }}>Taxonomy</TableHeadCell>
              <TableHeadCell css={{ width: '25%' }}>Confidence threshold</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            <TableRow
              css={{
                textTransform: 'uppercase',
                borderBottom: '1px solid $border',
                backgroundColor: '$backgroundExtraDark !important ',
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
              <TableCell>
                <BulkConfidenceLabel>Adjust all thresholds:</BulkConfidenceLabel>
              </TableCell>
              <TableCell>
                <ConfThreshold>
                  <Field name={`action.categoryConfig`}>
                    {({ form }) => (
                      <BulkConfidenceSlider form={form} filteredCategories={filteredCategories} />
                    )}
                  </Field>
                </ConfThreshold>
              </TableCell>
            </TableRow>
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
                  {config.taxonomy && <Taxonomy catName={catName} config={config} />}
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
        </Table> */}
      </FieldArray>
    </div>
  );
};

export default CategoryConfigList;
