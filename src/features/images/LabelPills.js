import React from 'react';
import { useDispatch } from 'react-redux';
import { styled, labelColors } from '../../theme/stitches.config.js';
import { setFocus } from '../images/imagesSlice';
import { toggleOpenLoupe } from '../loupe/loupeSlice';


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
    focused: {
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
    focused: {
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

const LabelPills = ({ image, imageIndex, focusIndex }) => {
  const isImageFocused = imageIndex === focusIndex.image;
  const dispatch = useDispatch();

  const handleLabelPillClick = (e, objIndex, lblIndex) => {
    e.stopPropagation();
    dispatch(setFocus({
      image: imageIndex,
      object: objIndex,
      label: lblIndex 
    }));
    dispatch(toggleOpenLoupe(true));
  };

  return (
    <LabelContainer>
      {image.objects.map((object, objIndex) => {

        // TODO: find a cleaner way to do this
        const labels = object.locked 
          ? [object.labels.find((label) => (
              label.validation && label.validation.validated
            ))]
          : object.labels.filter((label) => (
              label.validation === null || label.validation.validated
            ));

        return (
          <div key={object._id}>  {/* TODO: don't use index for key */}
          {labels.length > 0 &&
            <ObjectPill
              key={object._id}
              focused={isImageFocused && objIndex === focusIndex.object}
              locked={object.locked}
            >
              {labels.map((label, i) => {
                const lblIndex = object.labels.indexOf(label);
                return (
                  <LabelPill
                    key={label._id}
                    focused={isImageFocused &&
                      objIndex === focusIndex.object &&
                      lblIndex === focusIndex.label
                    }
                    onClick={(e) => handleLabelPillClick(e, objIndex, lblIndex)}
                    css={{
                      backgroundColor: labelColors(label.category).primary + 'b3', 
                    }}
                  >
                    {label.category}
                  </LabelPill>
                )
              })}
            </ObjectPill>
          }
          </div>
        )

        })}
    </LabelContainer>
  )
};

export default LabelPills;