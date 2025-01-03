import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@stitches/react';
import { CheckIcon, Pencil1Icon, ResetIcon } from '@radix-ui/react-icons';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { ButtonRow } from '../../components/Form';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { selectUserCurrentRoles } from '../auth/authSlice';
import {
  addUser,
  editUser,
  fetchUsers,
  selectUsers,
  selectUsersLoading,
  selectManageUserErrors,
  resendTempPassword,
} from './usersSlice.js';
import { hasRole, MANAGE_USERS_ROLES } from '../auth/roles';

const ManageUsersTable = () => {
  const dispatch = useDispatch();
  const currentUserRoles = useSelector(selectUserCurrentRoles);
  const users = useSelector(selectUsers);
  const isLoading = useSelector(selectUsersLoading);
  const errors = useSelector(selectManageUserErrors);
  const hasErrors = !isLoading && errors;

  const [usersClicked, setUsersClicked] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const userSorted = useMemo(
    () => [...users].sort((u1, u2) => (u1.email.toLowerCase() > u2.email.toLowerCase() ? 1 : -1)),
    [users],
  );

  const handleResendTempPassword = (email) => {
    dispatch(resendTempPassword({ username: email }));
    setUsersClicked([...usersClicked, email]);
  };

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
            {userSorted.map(({ email, roles, status }) => (
              <TableRow key={email}>
                <TableCell>{email}</TableCell>
                <TableCell>{roles.join(', ')}</TableCell>
                {hasRole(currentUserRoles, MANAGE_USERS_ROLES) && (
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButton
                          variant="ghost"
                          size="med"
                          onClick={() => dispatch(editUser(email))}
                        >
                          <Pencil1Icon />
                        </IconButton>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5}>
                        Edit user roles
                        <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>
                    {status === 'FORCE_CHANGE_PASSWORD' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconButton
                            variant="ghost"
                            size="med"
                            onClick={() => handleResendTempPassword(email)}
                            disabled={usersClicked.includes(email) && !hasErrors}
                          >
                            {usersClicked.includes(email) && !hasErrors ? (
                              <CheckIcon />
                            ) : (
                              <ResetIcon />
                            )}
                          </IconButton>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5}>
                          Resend Temp Password
                          <TooltipArrow />
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      <ButtonRow>
        <Button type="button" size="large" onClick={() => dispatch(addUser())}>
          Add user
        </Button>
      </ButtonRow>
    </Content>
  );
};

const Content = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const TableContainer = styled('div', {
  overflowY: 'scroll',
  maxHeight: '500px',
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
  padding: '5px 15px',
});

export default ManageUsersTable;
