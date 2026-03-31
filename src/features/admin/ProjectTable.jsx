import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTable, useSortBy } from 'react-table';
import { styled } from '../../theme/stitches.config.js';
import { selectLatestSnapshot } from './adminSlice';
import { TriangleUpIcon, TriangleDownIcon } from '@radix-ui/react-icons';
import ProjectMap from './ProjectMap';
import { StandAloneInput } from '../../components/Form.jsx';

const Section = styled('div', {
  background: '$loContrast',
  border: '1px solid $border',
  borderRadius: '$2',
  padding: '$4',
  marginBottom: '$4',
});

const TableWrapper = styled('div', {
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
  variants: {
    sticky: {
      true: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        background: '$loContrast',
        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.12)',
      },
    },
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
    sticky: {
      true: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        background: '$loContrast',
        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.12)',
        'tr:hover &': {
          background: '$backgroundDark',
        },
      },
    },
  },
});

const SearchRow = styled('div', {
  marginBottom: '$3',
  maxWidth: '320px',
});

const EmptyStateCell = styled('td', {
  padding: '$4 $3',
  color: '$textMedium',
  fontSize: '$3',
  fontStyle: 'italic',
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
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(() => {
    if (!snapshot?.projects) return [];
    return snapshot.projects.map((p) => ({
      projectName: p.projectName,
      organization: p.organization,
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

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQ = searchQuery.toLowerCase();
    return data.filter(
      (row) =>
        row.projectName?.toLowerCase().includes(lowerQ) ||
        row.organization?.toLowerCase().includes(lowerQ),
    );
  }, [data, searchQuery]);

  const columns = useMemo(
    () => [
      {
        Header: 'Project',
        accessor: 'projectName',
      },
      {
        Header: 'Organization',
        accessor: 'organization',
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
      data: filteredData,
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
      <ProjectMap />
      <SearchRow>
        <StandAloneInput
          type="text"
          placeholder="Search by project or organization…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          css={{ width: 320, height: 40, padding: '$0 $3', marginRight: '$3' }}
        />
      </SearchRow>
      <TableWrapper>
        <Table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup, hgIdx) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={hgIdx}>
                {headerGroup.headers.map((column) => (
                  <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                    sticky={column.id === 'projectName'}
                  >
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
            {rows.length === 0 && (
              <tr>
                <EmptyStateCell colSpan={columns.length}>
                  No projects match &ldquo;{searchQuery}&rdquo;.
                </EmptyStateCell>
              </tr>
            )}
            {rows.map((row) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => {
                    return (
                      <Td
                        {...cell.getCellProps()}
                        key={cell.column.id}
                        sticky={cell.column.id === 'projectName'}
                        numeric={
                          cell.column.id !== 'projectName' &&
                          cell.column.id !== 'stage' &&
                          cell.column.id !== 'organization'
                        }
                      >
                        {cell.render('Cell')}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>
    </Section>
  );
};

export default ProjectTable;
