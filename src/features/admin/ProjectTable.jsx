import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTable, useSortBy } from 'react-table';
import { styled } from '../../theme/stitches.config.js';
import { selectLatestSnapshot } from './adminSlice';
import { TriangleUpIcon, TriangleDownIcon } from '@radix-ui/react-icons';

const Section = styled('div', {
  background: '$loContrast',
  border: '1px solid $border',
  borderRadius: '$2',
  padding: '$4',
  marginBottom: '$4',
  overflowX: 'auto',
});

const SectionTitle = styled('h3', {
  fontSize: '$5',
  fontWeight: '$5',
  color: '$textDark',
  margin: '0 0 $3 0',
});

const Table = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '$3',
  fontFamily: '$roboto',
});

const Th = styled('th', {
  textAlign: 'left',
  padding: '$2 $3',
  borderBottom: '2px solid $border',
  color: '$textMedium',
  fontWeight: '$4',
  fontSize: '$2',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    color: '$textDark',
  },
});

const SortIconWrapper = styled('span', {
  display: 'inline-flex',
  verticalAlign: 'middle',
  marginLeft: '2px',
  color: '$textLight',
});

const Td = styled('td', {
  padding: '$2 $3',
  borderBottom: '1px solid $border',
  color: '$textDark',
  whiteSpace: 'nowrap',
  variants: {
    numeric: {
      true: {
        fontFamily: '$mono',
        textAlign: 'right',
      },
    },
  },
});

const Tr = styled('tr', {
  '&:hover': {
    backgroundColor: '$backgroundDark',
  },
});

const formatNumber = (val) => {
  if (val == null) return '—';
  return val.toLocaleString('en-US');
};

const capitalize = (str) => {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ProjectTable = () => {
  const snapshot = useSelector(selectLatestSnapshot);

  const data = useMemo(() => {
    if (!snapshot?.projects) return [];
    return snapshot.projects.map((p) => ({
      projectName: p.projectName,
      type: p.type,
      stage: p.stage,
      imageCount: p.imageCount,
      imagesReviewed: p.imagesReviewed,
      imagesNotReviewed: p.imagesNotReviewed,
      cameraCount: p.cameraCount,
      wirelessCameraCount: p.wirelessCameraCount,
      userCount: p.userCount,
      imagesAddedSinceLastSnapshot: p.imagesAddedSinceLastSnapshot,
    }));
  }, [snapshot]);

  const columns = useMemo(
    () => [
      {
        Header: 'Project',
        accessor: 'projectName',
      },
      {
        Header: 'Type',
        accessor: 'type',
        Cell: ({ value }) => capitalize(value),
      },
      {
        Header: 'Stage',
        accessor: 'stage',
        Cell: ({ value }) => capitalize(value),
      },
      {
        Header: 'Images',
        accessor: 'imageCount',
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: 'Reviewed',
        accessor: 'imagesReviewed',
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: 'Not Reviewed',
        accessor: 'imagesNotReviewed',
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: 'Cameras',
        accessor: 'cameraCount',
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: 'Wireless',
        accessor: 'wirelessCameraCount',
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: 'Users',
        accessor: 'userCount',
        Cell: ({ value }) => formatNumber(value),
      },
      {
        Header: 'New Images',
        accessor: 'imagesAddedSinceLastSnapshot',
        Cell: ({ value }) => formatNumber(value),
      },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [{ id: 'imageCount', desc: true }],
      },
    },
    useSortBy,
  );

  if (!data.length) return null;

  return (
    <Section>
      <SectionTitle>Projects</SectionTitle>
      <Table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, hgIdx) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={hgIdx}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                  {column.render('Header')}
                  <SortIconWrapper>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon />
                      ) : (
                        <TriangleUpIcon />
                      )
                    ) : null}
                  </SortIconWrapper>
                </Th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <Td
                    {...cell.getCellProps()}
                    key={cell.column.id}
                    numeric={
                      cell.column.id !== 'projectName' &&
                      cell.column.id !== 'type' &&
                      cell.column.id !== 'stage'
                    }
                  >
                    {cell.render('Cell')}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Section>
  );
};

export default ProjectTable;
