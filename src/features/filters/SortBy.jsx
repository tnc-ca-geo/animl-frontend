import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Accordion from '../../components/Accordion';
import { selectPaginatedField, selectSortAscending, sortChanged } from '../images/imagesSlice';
import { SortCheckbox } from './SortCheckbox';

export const SortBy = () => {
  const sortAsc = useSelector(selectSortAscending);
  const sortCriteria = useSelector(selectPaginatedField);
  const [sortBy, setSortBy] = useState(() => ({
    id: sortCriteria,
    desc: !sortAsc,
  }));

  const dispatch = useDispatch();

  const handleSortChanged = (criteria, isDesc) => {
    const newSortBy = {
      id: criteria,
      desc: isDesc,
    };
    setSortBy(newSortBy);
    dispatch(sortChanged([newSortBy]));
  };

  const isCurrentSort = (criteria, isDesc) => {
    return sortBy.id === criteria && sortBy.desc === isDesc;
  };

  return (
    <Accordion label="Sort" expandedDefault={false} expandOnHeaderClick={true}>
      <SortCheckbox
        label="Date created: most recent first"
        isCurrentSort={isCurrentSort('dateTimeOriginal', true)}
        handleSortChanged={() => handleSortChanged('dateTimeOriginal', true)}
      />
      <SortCheckbox
        label="Date created: most recent last"
        isCurrentSort={isCurrentSort('dateTimeOriginal', false)}
        handleSortChanged={() => handleSortChanged('dateTimeOriginal', false)}
      />
      <SortCheckbox
        label="Date added: most recent first"
        isCurrentSort={isCurrentSort('dateAdded', true)}
        handleSortChanged={() => handleSortChanged('dateAdded', true)}
      />
      <SortCheckbox
        label="Date added: most recent last"
        isCurrentSort={isCurrentSort('dateAdded', false)}
        handleSortChanged={() => handleSortChanged('dateAdded', false)}
      />
      <SortCheckbox
        label="Camera: alphabetical"
        isCurrentSort={isCurrentSort('cameraId', true)}
        handleSortChanged={() => handleSortChanged('cameraId', true)}
      />
      <SortCheckbox
        label="Camera: reverse alphabetical"
        isCurrentSort={isCurrentSort('cameraId', false)}
        handleSortChanged={() => handleSortChanged('cameraId', false)}
      />
    </Accordion>
  );
};
