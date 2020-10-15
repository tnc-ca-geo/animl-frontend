import React, { useMemo } from 'react';
import styled from 'styled-components'
import { useTable } from 'react-table'
import { IMAGE_BUCKET_URL } from '../../config';

const Styles = styled.div`
  /* This is required to make the table full-width */
  display: block;
  max-width: 100%;

  /* This will make the table scrollable when it gets too small */
  .tableWrap {
    display: block;
    max-width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    border-bottom: 1px solid black;
  }

  table {
    /* Make sure the inner table is always as wide as needed */
    width: 100%;
    border-spacing: 0;

    tr {
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
      border-bottom: 1px solid black;
      border-right: 1px solid black;

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
  }

  .pagination {
    padding: 0.5rem;
  }
`

const ImagesTable = ({ images }) => {

  const makeRows = (images) => {
    return images.map((image) => {
      const thumbUrl = 
        IMAGE_BUCKET_URL + 'thumbnails/' + image.hash + '-small.jpg';
      return {
        thumbnail: <img src={thumbUrl} />,
        ...image,
      }
    })
  };

  const data = makeRows(images);

  const columns = React.useMemo(() => [
      {
        Header: 'Thumbnail',
        accessor: 'thumbnail', // accessor is the "key" in the data
      },
      {
        Header: 'Hash',
        accessor: 'hash',
      },
      {
        Header: 'Bucket',
        accessor: 'bucket',
      },
      {
        Header: 'Serial Number',
        accessor: 'cameraSn',
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
    </Styles>
  );  

}

export default ImagesTable;
