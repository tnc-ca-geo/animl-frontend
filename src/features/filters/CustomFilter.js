import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import Accordion from '../../components/Accordion';

const CustomFilter = () => {
  const dispatch = useDispatch();

  // const handleCheckboxChange = (e) => {
  //   const payload = {
  //     filterCat: 'labels',
  //     val: e.target.dataset.category,
  //   };
  //   dispatch(checkboxFilterToggled(payload));
  // };

  return (
    <Accordion
      label='Custom'
      expandedDefault={false}
    >
      custom filter input
    </Accordion>
  );
};

export default CustomFilter;

