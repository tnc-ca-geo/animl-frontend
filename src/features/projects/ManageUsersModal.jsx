import { useSelector } from 'react-redux';

import { selectMode } from './usersSlice.js';
import ManageUsersAddForm from './ManageUsersAddForm.jsx';
import ManageUsersEditForm from './ManageUsersEditForm.jsx';
import ManageUsersTable from "./ManageUsersTable";

const ManageUsersModal = () => {
  const mode = useSelector(selectMode);

  switch(mode) {
    case 'addUser':
      return <ManageUsersAddForm />
    case 'editUser':
      return <ManageUsersEditForm />
    default:
      return <ManageUsersTable />
  }
}

export default ManageUsersModal;
