import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@stitches/react';
import { Pencil1Icon } from '@radix-ui/react-icons';

import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from '../../components/Tooltip.jsx';
import { ButtonRow } from '../../components/Form';
import { addUser, editUser, fetchUsers, selectMode, selectUsers } from './userSlice.js';
import ManageUsersAddForm from './ManageUsersAddForm.jsx';
import ManageUsersEditForm from './ManageUsersEditForm.jsx';

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

const ManageUsersModal = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const mode = useSelector(selectMode);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  switch(mode) {
    case 'addUser':
      return <ManageUsersAddForm />
    case 'editUser':
      return <ManageUsersEditForm />

    default:
      return (
        <Content>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>User email</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {users.map(({ email }) => (
                  <TableRow key={email}>
                    <TableCell>{email}</TableCell>
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
      )
  }
}

export default ManageUsersModal;
