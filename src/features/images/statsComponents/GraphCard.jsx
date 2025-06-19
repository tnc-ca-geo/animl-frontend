import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  ResponsiveContainer,
} from 'recharts';
import { indigo } from '@radix-ui/colors';

import StatsCard from "./StatsCard";
import Heading from './Heading';

const GraphCard = ({ label, list, content, dataKey }) => {
  let width = 0;
  const data = [];

  for (const [objkey, objval] of Object.entries(list)) {
    data.push({ name: objkey, [dataKey]: objval });
    width = Math.max(width, objkey.length);
  }

  data.sort(function (a, b) {
    return b[dataKey] - a[dataKey];
  });

  width = (width - 6) * 9 + 60;

  return (
    <StatsCard>
      <Heading content={content} label={label} />
      <ResponsiveContainer
        width="100%"
        height={250 + (data.length > 12 ? (data.length - 12) * 20 : 0)}
      >
        <BarChart layout="vertical" data={data}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickFormatter={(tick) => tick.toLocaleString('en-US')}
          />
          <YAxis width={width} dataKey="name" type="category" scale="auto" interval={0} />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill={indigo.indigo11} />
        </BarChart>
      </ResponsiveContainer>
    </StatsCard>
  );
};

export default GraphCard;
