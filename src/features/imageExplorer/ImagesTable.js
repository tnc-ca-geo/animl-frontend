import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTable, useSortBy } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LabelPill = styled.span`
  background-color: ${props => props.theme.tokens.colors.$gray2};
  padding: 4px 8px;
  border-radius: 4px;
`

const Styles = styled.div`
  /* This is required to make the table full-width */
  display: block;
  max-width: 100%;

  /* This will make the table scrollable when it gets too small */
  .tableWrap {
    display: block;
    margin: ${props => props.theme.tokens.space.$3};;
    max-width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
  }

  table {
    /* Make sure the inner table is always as wide as needed */
    width: 100%;
    border-spacing: 0;

    tbody {
      tr {
        background-color: ${props => props.theme.tokens.colors.$gray0};
      }
    }

    tr {
      td {
        font-family: ${props => props.theme.monoFont};
      }
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      text-align: left;
      /* The secret sauce */
      /* Each cell should grow equally */
      width: 1%;
      /* But "collapsed" cells should be as small as possible */
      &.collapse {
        width: 0.0000000001%;
      }

      :last-child {
        border-right: 0;
      }
    }

    td {
      border-bottom: 10px solid ${props => props.theme.tokens.colors.$gray1};
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`

const TableHeader = styled.div`
  color: ${props => (props.isSorted)
    ? props.theme.tokens.colors.$gray4
    : props.theme.tokens.colors.$gray3
  };

  svg {
    margin-left: 8px;
    path {
      fill: ${props => (props.isSorted)
        ? props.theme.tokens.colors.$gray4
        : props.theme.tokens.colors.$gray3
      };
  }
`;

const ImagesTable = ({ images }) => {

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
        accessor: 'thumbnail', // accessor is the 'key' in the data
        disableSortBy: true,
      },
      {
        Header: 'Date Created',
        accessor: 'dateCreated',
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
  }, useSortBy);

  useEffect(() => {
    console.log('sort by event detected: ', sortBy);
  }, [sortBy]);

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
                      canSort={column.canSort}
                      isSorted={column.isSorted}
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
