import React from 'react';
import Heading from './Heading';
import StatsCard from './StatsCard';
import { styled } from '@stitches/react';

const Table = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'scroll',
  borderRadius: '5px',
  border: '1px solid $border',
  maxHeight: '300px',
});

const Row = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  maxHeight: '50px',
});

const TableCell = styled('div', {
  borderBottom: '1px solid $border',
  textAlign: 'left',
  minWidth: '200px',
  width: '100%',
  marginRight: '1px',
  padding: '$2',
  overflowX: 'scroll',
});

const ListTableHeader = (list) => (
  <Row>
    {Object.keys(list.list[0]).map((keyName) => (
      <TableCell key={keyName} css={{ background: '$backgroundDark' }}>
        {keyName == 'userId' ? 'User' : keyName === 'reviewedCount' ? 'Reviewed Count' : keyName}
      </TableCell>
    ))}
  </Row>
);

const ListCard = ({ label, list, content }) => (
  <StatsCard>
    <Heading content={content} label={label} />
    <Table>
      {list && <ListTableHeader list={list} />}
      {list.map((stat, index) => (
        <Row key={index}>
          {Object.keys(stat).map((keyName, i) => (
            <TableCell key={i}>{stat[keyName].toLocaleString('en-US')}</TableCell>
          ))}
        </Row>
      ))}
    </Table>
  </StatsCard>
);

export default ListCard;
