import React, { useMemo } from 'react';
import styled from 'styled-components'
import { useTable } from 'react-table'

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
    margin: 15px;
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

      console.log(labelCagegories)

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

  const columns = React.useMemo(() => [
      {
        Header: '',
        accessor: 'thumbnail', // accessor is the "key" in the data
      },
      {
        Header: 'Date Created',
        accessor: 'dateCreated',
      },
      {
        Header: 'Labels',
        accessor: 'labelCagegories',
      },
      {
        Header: 'Needs Review',
        accessor: 'needsReview',
      },
      {
        Header: 'Camera',
        accessor: 'cameraSn',
      },
      {
        Header: 'Camera make',
        accessor: 'make',
      },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  return (
    <Styles>
      <div className="tableWrap">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                    return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
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
