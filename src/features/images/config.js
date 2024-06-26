export const defaultColumnDims = {
  minWidth: 30,
  width: 100, // width is used for both the flex-basis and flex-grow
  maxWidth: 400,
};

export const columnConfig = [
  {
    accessor: 'thumbnail',
    disableSortBy: true,
    width: '155',
    disableResizing: true,
  },
  {
    Header: 'Labels',
    accessor: 'labelPills',
    disableSortBy: true,
    width: '260',
  },
  {
    Header: 'Date created',
    accessor: 'dtOriginal',
    width: '150'
  },
  {
    Header: 'Date added',
    accessor: 'dtAdded',
  },
  {
    Header: 'Reviewed',
    accessor: 'reviewedIcon',
    disableSortBy: true,
    width: '50'
  },
  {
    Header: 'Camera',
    accessor: 'cameraId',
  },
  {
    Header: 'Deployment',
    accessor: 'deploymentName',
    disableSortBy: true,
  },
];

export const tableBreakpoints = [
  ['xxs', 540],
  ['xs', 640],
  ['sm', 740],
  ['md', 840],
  ['lg', 940],
  ['xl', Infinity]
];

export const columnsToHideMap = {
  'loupeOpen': ['dtOriginal', 'dtAdded', 'reviewedIcon', 'cameraId', 'deploymentName'],
  'xxs': ['dtAdded', 'deploymentName', 'cameraId', 'reviewedIcon', 'dtOriginal'],
  'xs': ['dtAdded', 'deploymentName', 'cameraId', 'reviewedIcon'],
  'sm': ['dtAdded', 'deploymentName', 'cameraId'],
  'md': ['dtAdded', 'deploymentName'],
  'lg': ['dtAdded']
}