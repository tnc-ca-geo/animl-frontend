import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Accordion from '../../components/Accordion';
import { selectSortAscending, sortChanged } from '../images/imagesSlice';
import { useState } from 'react';
import { SortCheckboxes } from './SortCheckboxes';

export const SortBy = () => {
  const sortAsc = useSelector(selectSortAscending);
  console.log(sortAsc, 'sort asc');
  const [sortBy, setSortBy] = useState({
    dtOriginal: true,
    dtAdded: true,
    cameraId: true,
  });
  const dispatch = useDispatch();
  // Only one sort field can be active at once
  // paginated field and sort asc keep the state
  // all other checkboxes should be disabled

  const handleSortChanged = (criteria, isDesc) => {
    const updatedSortBy = {
      ...sortBy,
      [criteria]: isDesc,
    };
    const dispatchSortBy = Object.entries(updatedSortBy).reduce(
      (acc, [criteria, isDesc]) => [
        ...acc,
        {
          id: criteria,
          desc: isDesc,
        },
      ],
      [],
    );
    console.log(updatedSortBy);
    setSortBy(updatedSortBy);
    dispatch(sortChanged(dispatchSortBy));
  };

  return (
    <Accordion label="Sort by" expandedDefault={false} expandOnHeaderClick={true}>
      {/* Date created */}
      <SortCheckboxes
        handleSortChanged={(isDesc) => handleSortChanged('dtOriginal', isDesc)}
        isDesc={sortBy['dtOriginal']}
        headerLabel="Date created"
        descLabel="most recent first"
        ascLabel="most recent last"
      />
      {/* Date added */}
      <SortCheckboxes
        handleSortChanged={(isDesc) => handleSortChanged('dtAdded', isDesc)}
        isDesc={sortBy['dtAdded']}
        headerLabel="Date added"
        descLabel="most recent first"
        ascLabel="most recent last"
      />
      {/* Camera ID */}
      <SortCheckboxes
        handleSortChanged={(isDesc) => handleSortChanged('cameraId', isDesc)}
        isDesc={sortBy['cameraId']}
        headerLabel="Camera"
        descLabel="alphabetical"
        ascLabel="reverse alphabetical"
      />
    </Accordion>
  );
};
