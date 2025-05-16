import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config';
import { Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons';
import { MapPin } from 'lucide-react';
import { hasRole, WRITE_DEPLOYMENTS_ROLES } from '../auth/roles';
import IconButton from '../../components/IconButton';
import { useSelector } from 'react-redux';
import { selectGlobalBreakpoint } from '../projects/projectsSlice';
import { globalBreakpoints } from '../../config';
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { shortenedField } from '../../app/utils';
import { selectUserCurrentRoles } from '../auth/authSlice';
import { DateTime } from 'luxon';

const ItemValue = styled('div', {
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  color: '$textDark',
});

const Bookend = styled('span', {
  fontStyle: 'italic',
  color: '$textMedium',
});

const DepItem = styled('div', {
  fontSize: '$3',
  marginLeft: '0',
  '@bp2': {
    marginLeft: '$9',
  },
  display: 'grid',
  gridTemplateColumns: 'auto auto auto',
  alignContent: 'center',
  color: '$textDark',
  '&:not(:last-child)': {
    borderBottom: '1px solid $gray6',
  },
});

const DepButtons = styled('div', {
  display: 'flex',
  marginLeft: 'auto',
});

const DepName = styled('div', {
  display: 'flex',
  alignItems: 'center',
});

const DepDates = styled('div', {
  placeSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  color: '$textDark',
});

const Date = styled('span', {
  variants: {
    type: {
      start: {
        textAlign: 'right',
      },
      end: {
        textAlign: 'left',
      },
    },
  },
});

const DateDash = styled('span', {
  paddingLeft: '$2',
  paddingRight: '$2',
});

const formatDate = (date) => {
  return DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT);
};

export const DeploymentItem = ({ deployment, cameraId, handleDelete, handleSave }) => {
  const userRoles = useSelector(selectUserCurrentRoles);

  const currentBreakpoint = useSelector(selectGlobalBreakpoint) ?? 'xl';
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  const alwaysOpen = !isSmallScreen;
  const [isOpen, setIsOpen] = useState(false);

  const deploymentName = deployment.name === 'default' ? `${cameraId} (default)` : deployment.name;

  const dawnOfTime = isSmallScreen ? '' : 'dawn of time';

  const today = isSmallScreen ? '' : 'today';

  return (
    <DepItem key={deployment._id}>
      <DepName>
        <MapPin size={14} style={{ marginRight: '12px' }} />
        {isSmallScreen ? (
          <Tooltip onOpenChange={setIsOpen} open={alwaysOpen || isOpen}>
            <TooltipTrigger asChild>
              <ItemValue onClick={() => setIsOpen(!isOpen)}>
                {shortenedField(deploymentName)}
              </ItemValue>
            </TooltipTrigger>
            <TooltipContent>
              {deploymentName}
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>
        ) : (
          deploymentName
        )}
      </DepName>
      <DepDates>
        <Date type="start">
          {deployment.startDate ? (
            formatDate(deployment.startDate)
          ) : (
            <Bookend>{dawnOfTime}</Bookend>
          )}
        </Date>
        <DateDash>-</DateDash>
        <Date type="end">
          {deployment.endDate ? formatDate(deployment.endDate) : <Bookend>{today}</Bookend>}
        </Date>
      </DepDates>
      {hasRole(userRoles, WRITE_DEPLOYMENTS_ROLES) && (
        <DepButtons>
          <IconButton
            variant="ghost"
            size="small"
            css={{ marginRight: '$1' }}
            onClick={() =>
              handleSave({
                cameraId: cameraId,
                deployment: deployment,
              })
            }
            disabled={deployment.editable === false}
          >
            <Pencil1Icon />
          </IconButton>
          <IconButton
            variant="ghost"
            size="small"
            onClick={() =>
              handleDelete({
                cameraId: cameraId,
                deployment: deployment,
              })
            }
            disabled={deployment.editable === false}
          >
            <Cross2Icon />
          </IconButton>
        </DepButtons>
      )}
    </DepItem>
  );
};
