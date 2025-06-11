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
        label="Date created: newest to oldest"
        isCurrentSort={isCurrentSort('dateTimeOriginal', true)}
        handleSortChanged={() => handleSortChanged('dateTimeOriginal', true)}
      />
      <SortCheckbox
        label="Date created: oldest to newest"
        isCurrentSort={isCurrentSort('dateTimeOriginal', false)}
        handleSortChanged={() => handleSortChanged('dateTimeOriginal', false)}
      />
      <SortCheckbox
        label="Date added: newest to oldest"
        isCurrentSort={isCurrentSort('dateAdded', true)}
        handleSortChanged={() => handleSortChanged('dateAdded', true)}
      />
      <SortCheckbox
        label="Date added: oldest to newest"
        isCurrentSort={isCurrentSort('dateAdded', false)}
        handleSortChanged={() => handleSortChanged('dateAdded', false)}
      />
    </Accordion>
  );
};
