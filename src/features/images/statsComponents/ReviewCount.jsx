import React from 'react';
import { styled } from '@stitches/react';
import { indigo } from '@radix-ui/colors';
import Heading from './Heading';
import StatsCard from './StatsCard';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const NumerContainer = styled('div', {
  width: '100%',
  marginTop: '15px',
});

const LargeNumber = styled('span', {
  fontSize: '30px',
  fontWeight: '$5',
  color: indigo.indigo11,
  width: '100%',
});

const SmallNumber = styled('div', {
  width: '100%',
  textAlign: 'right',
  alignSelf: 'flex-end',
});

const RatioCard = ({ label, tnum, bnum, content }) => {
  return (
    <StatsCard>
      <Heading content={content} label={label} />
      <Container>
        <NumerContainer>
          <LargeNumber>{tnum.toLocaleString('en-US')}</LargeNumber>
        </NumerContainer>
        {bnum && <SmallNumber>/ {bnum.toLocaleString('en-US')}</SmallNumber>}
      </Container>
    </StatsCard>
  );
};

const ReviewCounts = ({
  label,
  count,
  reviewedCount,
  notReviewedCount,
  countHint,
  reviewedHint,
  notReviewedHint,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
      <RatioCard label={label} tnum={count} content={countHint} />
      {reviewedCount !== undefined && (
        <RatioCard
          label="Reviewed"
          tnum={reviewedCount}
          // bnum={stats.imageCount}
          content={reviewedHint}
        />
      )}
      {notReviewedCount !== undefined && (
        <RatioCard
          label="Not reviewed"
          tnum={notReviewedCount}
          // bnum={stats.imageCount}
          content={notReviewedHint}
        />
      )}
    </div>
  );
};

export default ReviewCounts;
