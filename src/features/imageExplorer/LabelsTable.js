import React, { useMemo } from 'react';
import { styled } from '../../theme/stitches.config';
import { useTable } from 'react-table';

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
    margin: '$3 $0',
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
        ':hover': {
          backgroundColor: '$gray300',
          cursor: 'pointer',
        },
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
  fontSize: '$2',
  fontWeight: '$3',
  color: '$gray500',
});

const makeRows = (labels) => {
  return labels.map((label) => {
    console.log('label: ', label);
    return {
      validated: label.validation.validated,
      categoryPill: <LabelPill>{label.category}</LabelPill>,
      ...label,
    }
  })
};

const LabelsTable = ({ labels }) => {

  const data = makeRows(labels);

  const columns = useMemo(() => [
    {
      Header: 'Category',
      accessor: 'categoryPill',
    },
    {
      Header: 'Confidence',
      accessor: 'conf',
    },
    {
      Header: 'Type',
      accessor: 'type',
    },
    {
      Header: 'Labeled by',
      accessor: 'user', // or model if type = ml
    },
    {
      Header: 'Validated',
      accessor: 'validated',
    },
], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  return (
    <Styles>
      <div className='tableWrap'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    <TableHeader>
                      {column.render('Header')}
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
  )
};

export default LabelsTable;