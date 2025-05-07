import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FieldArray } from 'formik';
import { StandAloneInput as Input } from '../../components/Form.jsx';
import CategoryConfigForm from './CategoryConfigForm.jsx';

const CategoryConfigFilter = styled('div', {
  display: 'flex',
  marginBottom: '$3',
  width: '300px',
});

const CategoryConfigList = ({ values }) => {
  // filter categories
  const [categoryFilter, setCategoryFilter] = useState('');

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
        <>
          {Object.entries(values.action.categoryConfig)
            .filter(([k]) => !(values.action.model.value.includes('megadetector') && k === 'empty')) // NOTE: manually hiding "empty" categories b/c it isn't a real category returned by MDv5
            .filter(([k]) => {
              if (categoryFilter) {
                return k.toLowerCase().includes(categoryFilter.toLowerCase());
              } else {
                return true;
              }
            })
            .map(([k, v]) => (
              <CategoryConfigForm key={k} catName={k} config={v} />
            ))}
        </>
      </FieldArray>
    </div>
  );
};

export default CategoryConfigList;
