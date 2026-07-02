import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
  DropdownMenuItemIconLeft,
} from '../../components/Dropdown.jsx';
import { ArrowUpDown, Check } from 'lucide-react';
import {
  selectAllDeploymentsSortOrders,
  selectDeploymentsSortOrder,
  setPreference,
} from '../user/userSlice';
import { DEPLOYMENT_SORT_ORDERS, DEPLOYMENT_SORT_ORDER_LABELS } from '../user/constants';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  height: '24px',
  width: '24px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  padding: '0',
  color: '$textMedium',
  borderRadius: '$1',
  cursor: 'pointer',
  '&:hover': {
    color: '$hiContrast',
  },
});

const DeploymentSortByButton = ({ projectId }) => {
  const dispatch = useDispatch();
  const current = useSelector(selectDeploymentsSortOrder(projectId));
  const allSortOrders = useSelector(selectAllDeploymentsSortOrders);

  const handleSelect = (sortOrder) => () => {
    if (!DEPLOYMENT_SORT_ORDERS.includes(sortOrder) || current === sortOrder) return;
    const nextMap = { ...allSortOrders, [projectId]: sortOrder };
    dispatch(setPreference({ name: 'deploymentsSortOrder', value: nextMap }));
  };

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger aria-label="Sort deployments">
        <ArrowUpDown size={14} />
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={5}>
        {DEPLOYMENT_SORT_ORDERS.map((order) => (
          <DropdownMenuItem key={order} onSelect={handleSelect(order)}>
            <DropdownMenuItemIconLeft>
              {current === order && <Check size={14} />}
            </DropdownMenuItemIconLeft>
            {DEPLOYMENT_SORT_ORDER_LABELS[order]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeploymentSortByButton;
