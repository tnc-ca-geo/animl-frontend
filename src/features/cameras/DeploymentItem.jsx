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
import { selectUserCurrentRoles } from '../auth/authSlice';
import { DateTime } from 'luxon';

const ItemValue = styled('div', {
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  color: '$textDark',
});

const Bookend = styled('span', {
  fontStyle: 'italic',
  '@bp2': {
    color: '$textMedium',
  }
});

const DepItem = styled('div', {
  fontSize: '$3',
  marginLeft: '0',
  gridTemplateColumns: 'auto auto',
  '@bp2': {
    marginLeft: '$9',
    gridTemplateColumns: 'auto auto auto',
  },
  display: 'grid',
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
  '@bp2': {
    width: '250px'
  }
});

const DepDates = styled('div', {
  placeSelf: 'center',
  color: '$textDark',
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  '@bp2': {
    alignItems: 'center',
  },
});

const Date = styled('span', {
  '@bp2': {
    minWidth: '50px',
    fontFamily: 'unset',
  },
  fontFamily: '$sourceSansPro',
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

  return (
    <DepItem key={deployment._id}>
      <DepName>
        <MapPin size={14} style={{ marginRight: '12px' }} />
        {isSmallScreen ? (
          <Tooltip onOpenChange={setIsOpen} open={alwaysOpen || isOpen}>
            <TooltipTrigger asChild>
              <ItemValue onClick={() => setIsOpen(!isOpen)}>
                { deploymentName }
              </ItemValue>
            </TooltipTrigger>
            <TooltipContent>
                <Date type="start">
                  {deployment.startDate ? (
                    formatDate(deployment.startDate)
                  ) : (
                      <Bookend>dawn of time</Bookend>
                    )}
                </Date>
                <DateDash>-</DateDash>
                <Date type="end">
                  {deployment.endDate ? formatDate(deployment.endDate) : <Bookend>today</Bookend>}
                </Date>
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>
        ) : (
          deploymentName
        )}
      </DepName>
      { !isSmallScreen && (
        <DepDates>
          <Date type="start">
            {deployment.startDate ? (
              formatDate(deployment.startDate)
            ) : (
                <Bookend>dawn of time</Bookend>
              )}
          </Date>
          <DateDash>-</DateDash>
          <Date type="end">
            {deployment.endDate ? formatDate(deployment.endDate) : <Bookend>today</Bookend>}
          </Date>
        </DepDates>
      )}
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
