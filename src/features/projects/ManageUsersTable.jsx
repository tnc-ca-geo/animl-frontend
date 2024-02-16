import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@stitches/react';
import { Pencil1Icon } from '@radix-ui/react-icons';

import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from '../../components/Tooltip.jsx';
import { ButtonRow } from '../../components/Form';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { addUser, editUser, fetchUsers, selectUsers, selectUsersLoading } from './usersSlice.js';

const ManageUsersTable = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const isLoading = useSelector(selectUsersLoading);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const userSorted = useMemo(
    () => [...users].sort((u1, u2) => u1.email.toLowerCase() > u2.email.toLowerCase() ? 1 : -1),
    [users]
  );

  return (
    <Content>
      {isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeadCell css={{ width: '60%' }}>User email</TableHeadCell>
              <TableHeadCell css={{ width: '25%' }}>Roles</TableHeadCell>
              <TableHeadCell css={{ width: '15%' }}> Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody>
            {userSorted.map(({ email, roles }) => (
              <TableRow key={email}>
                <TableCell>{email}</TableCell>
                <TableCell>{roles.join(', ')}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        variant='ghost'
                        size='large'
                        onClick={() => dispatch(editUser(email))}
                      >
                        <Pencil1Icon />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5} >
                      Edit user roles
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <ButtonRow>
        <Button type='button' size='large' onClick={() => dispatch(addUser())}>
          Add user
        </Button>
      </ButtonRow>
    </Content>
  );
}

const Content = styled('div', {
  display: 'flex',
  flexDirection: 'column'
});

const TableContainer = styled('div', {
  overflowY: 'scroll',
  maxHeight: '500px'
});

const Table = styled('table', {
  borderSpacing: '0',
  borderCollapse: 'collapse',
  width: '100%',
  tableLayout: 'fixed',
  marginBottom: '15px',
});

const TableHeadCell = styled('th', {
  color: '$textMedium',
  fontSize: '$2',
  fontWeight: '400',
  textTransform: 'uppercase',
  textAlign: 'left',
  verticalAlign: 'bottom',
  padding: '5px 15px',
  borderBottom: '1px solid',
  borderTop: '1px solid',
  borderColor: '$border',
});

const TableRow = styled('tr', {
  '&:nth-child(odd)': {
    backgroundColor: '$backgroundDark',
  },
});

const TableCell = styled('td', {
  color: '$textDark',
  fontSize: '$3',
  fontWeight: '400',
  padding: '5px 15px'
});

export default ManageUsersTable;
