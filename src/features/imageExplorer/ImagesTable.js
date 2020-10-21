import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useTable, useSortBy } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  selectPaginatedField,
  selectSortAscending,
  sortChanged,
} from './imagesSlice';

const LabelPill = styled.span({
  backgroundColor: '$gray300',
  padding: '$1 $2',
  borderRadius: '4px',
});

const Styles = styled.div({
  display: 'block',
  maxWidth: '100%',

  '.tableWrap': {
    display: 'block',
    margin: '$3',
    maxWidth: '100%',
    // overflowX: 'scroll',
    overflowY: 'hidden',
  },

  'table': {
    width: '100%',
    borderSpacing: '0',
    'tbody': {
      'tr': {
        backgroundColor: '$loContrast',
      },
    },
    'tr': {
      'td': {
        fontFamily: '$mono',
        ':last-child': {
          borderRight: '0',
        }
      }
    },
    'th, td': {
      margin: '$0',
      padding: '0.5rem',
      textAlign: 'left',
      // The secret sauce
      // Each cell should grow equally
      width: '1%',
      // But "collapsed" cells should be as small as possible
      '&.collapse': {
        width: '0.0000000001%',
      },
      ':last-child': {
        borderRight: '0',
      },
    },
    'td': {
      borderBottom: '$2 solid $gray200',
    }
  }
});

const TableHeader = styled.div({
  'svg': {
    marginLeft: '$3',
    'path': {
      fill: '$gray600',
    }
  },
  variants: {
    issorted: {
      true: {
        color: '$hiContrast',
        'svg path': { fill: '$hiContrast' },
      },
      false: {
        color: '$gray600',
        'svg path': { fill: '$gray600' },
      },
    },
  },
});

const ImagesTable = ({ images }) => {
  const dispatch = useDispatch();
  const paginatedFiled = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);

  const makeRows = (images) => {
    return images.map((image) => {
      const thumbnail = <img src={image.thumbUrl} />;
      
      const labelCagegories = 
        <div>
          {image.labels.map((label, index) => (
            <LabelPill key={index}>{label.category}</LabelPill>
          ))}
        </div>;

      let needsReview = 'Yes'; 
      image.labels.forEach((label) => {
        if (label.validation.reviewed) {
          needsReview = 'No';
        }
      });

      return {
        thumbnail,
        labelCagegories,
        needsReview,
        ...image,
      }
    })
  };

  const data = makeRows(images);

  const columns = useMemo(() => [
      {
        Header: '',
        accessor: 'thumbnail',
        disableSortBy: true,
      },
      {
        Header: 'Date Created',
        accessor: 'dateTimeOriginal',
      },
      {
        Header: 'Labels',
        accessor: 'labelCagegories',
        disableSortBy: true,
      },
      {
        Header: 'Needs Review',
        accessor: 'needsReview',
        disableSortBy: true,
      },
      {
        Header: 'Camera',
        accessor: 'cameraSn',
      },
      {
        Header: 'Camera make',
        accessor: 'make',
        disableSortBy: true,
      },
  ], []);

  const initialState = {
    sortBy: [
      {
        id: paginatedFiled,
        desc: !sortAscending,
      }
    ],
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy },
  } = useTable({
    columns,
    data,
    manualSortBy: true,
    initialState,
  }, useSortBy);

  useEffect(() => {
    dispatch(sortChanged(sortBy));
  }, [sortBy, dispatch]);

  return (
    <Styles>
      <div className='tableWrap'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <TableHeader
                      issorted={column.isSorted.toString()}
                      cansort={column.canSort.toString()}
                    >
                      {column.render('Header')}
                      {column.canSort && 
                        <FontAwesomeIcon icon={ 
                          column.isSortedDesc 
                            ? ['fas', 'caret-down'] 
                            : ['fas', 'caret-up']
                        }/>
                      }
                    </TableHeader>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Styles>
  );  

}

export default ImagesTable;
