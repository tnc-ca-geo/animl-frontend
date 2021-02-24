import React from 'react';
import { styled, labelColors } from '../../theme/stitches.config.js';

const LabelPill = styled('div', {
  // backgroundColor: '$gray300',
  // border: '$1 solid $hiContrast',
  color: '$hiContrast',
  fontSize: '$2',
  fontFamily: '$mono',
  padding: '$1 $3',
  ':not(:last-child)': {
    marginRight: '$2',
  },
  borderRadius: '$3',
  border: '1px solid rgba(0,0,0,0)',
  // textTransform: 'uppercase',
  transition: 'all 0.2s ease',
  variants: {
    selected: {
      true: {
        outline: 'none',
        boxShadow: '0 0 0 3px $blue200',
        borderColor: '$blue500',  
      }
    }
  }
});

const ObjectPill = styled('div', {
  display: 'flex',
  padding: '$1',
  border: '$1 solid $gray400',
  borderRadius: '$4',
  margin: '$1',
  variants: {
    selected: {
      true: {
        outline: 'none',
        boxShadow: '0 0 0 3px $blue200',
        borderColor: '$blue500',  
      }
    },
    locked: {
      true: {
        borderColor: '$hiContrast',
      }
    }
  }
})

const LabelContainer = styled('div', {
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
});

const LabelPills = ({ image, imageIndex, loupeIndex }) => {
  const imageSelected = imageIndex === loupeIndex.images;

  return (
    <LabelContainer>
      {image.objects.map((object, objIndex) => {
        // TODO: must be a better way to do this
        const labels = object.locked 
          ? [object.labels.find((label) => label.validation.validated )]
          : object.labels.filter((label) => (
              label.validation === null || label.validation.validated
            ));
        return (
          <div>
          {labels.length > 0 &&
            <ObjectPill
              key={objIndex}
              selected={imageSelected && objIndex === loupeIndex.objects}
              locked={object.locked}
            >
              {labels.map((label, lblIndex) => (
                <LabelPill
                  key={lblIndex}
                  selected={imageSelected &&
                    objIndex === loupeIndex.objects &&
                    lblIndex === loupeIndex.labels
                  }
                  css={{
                    backgroundColor: labelColors[label.category].primary + 'b3', 
                  }}
                >
                  {label.category}
                </LabelPill>
              ))
              }
            </ObjectPill>
          }
          </div>
        )

        })}
    </LabelContainer>
  )
};

export default LabelPills;