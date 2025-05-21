import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Accordion from '../../components/Accordion';
import { selectPaginatedField, selectSortAscending, sortChanged } from '../images/imagesSlice';
import { SortCheckbox } from './SortCheckbox';

export const SortBy = () => {
  const sortAsc = useSelector(selectSortAscending);
  const sortCriteria = useSelector(selectPaginatedField);
  const dispatch = useDispatch();

  const handleSortChanged = (criteria, isDesc) => {
    dispatch(
      sortChanged([
        {
          id: criteria,
          desc: isDesc,
        },
      ]),
    );
  };

  const isCurrentSort = (criteria, isDesc) => {
    return sortCriteria === criteria && !sortAsc === isDesc;
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
