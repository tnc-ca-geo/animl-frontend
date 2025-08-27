import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectLabels } from '../projects/projectsSlice.js';
import { setFocus } from '../review/reviewSlice.js';
import { toggleOpenLoupe } from '../loupe/loupeSlice.js';
import LabelPill from '../../components/LabelPill.jsx';
import { SimpleSpinner } from '../../components/Spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow,
} from '../../components/Tooltip.jsx';

const ObjectPill = styled('div', {
  display: 'flex',
  padding: '$1',
  border: '1px solid transparent',
  // backgroundColor: '$gray3',
  borderRadius: '$4',
  margin: '$1',
  variants: {
    focused: {
      true: {
        outline: 'none',
        boxShadow: '0 0 0 3px $blue200',
        borderColor: '$blue500',
      },
    },
    locked: {
      true: {
        backgroundColor: 'transparent',
        // borderColor: '$gray10',
      },
      false: {
        borderColor: '$gray10',
        borderStyle: 'dashed',
      },
    },
  },
});

const LabelContainer = styled('div', {
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  userSelect: 'none',
});

const SpinnerContainer = styled('div', {
  display: 'flex',
});

const LabelPills = ({ objects, imageIndex, focusIndex, awaitingPrediction }) => {
  const isImageFocused = imageIndex === focusIndex.image;
  const dispatch = useDispatch();
  const projectLabels = useSelector(selectLabels);

  const handleLabelPillClick = (e, objIndex, lblIndex) => {
    // if user isn't attempting a multi-row selection, update focus
    if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
      const newIndex = { image: imageIndex, object: objIndex, label: lblIndex };
      dispatch(setFocus({ index: newIndex, type: 'manual' }));
      dispatch(toggleOpenLoupe(true));
    }
  };

  return (
    <LabelContainer>
      {awaitingPrediction && (
        <Tooltip>
          <TooltipTrigger asChild>
            <SpinnerContainer css={{ margin: '$1' }}>
              <SimpleSpinner />
            </SpinnerContainer>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Awaiting ML prediction. Refresh data for latest results.
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}
      {objects.map((object, objIndex) => {
        // TODO: find a cleaner way to do this. Maybe make it a hook?
        // We also need filtered objects in FullSizeImage component...
        // and reviewMiddleware so consider encapsulating
        let labels;
        if (object.locked) {
          const firstValidatedLabel = object.labels.find(
            (label) => label.validation && label.validation.validated,
          );
          labels = firstValidatedLabel ? [firstValidatedLabel] : [];
        } else {
          const allNonInvalLabels = object.labels.filter(
            (label) => label.validation === null || label.validation.validated,
          );
          labels = allNonInvalLabels;
        }

        return (
          <div key={object._id}>
            {labels.length > 0 && (
              <ObjectPill
                key={object._id}
                focused={isImageFocused && objIndex === focusIndex.object}
                locked={object.locked}
              >
                {labels.map((label) => {
                  const lblIndex = object.labels.indexOf(label);
                  const l = projectLabels?.find(({ _id }) => label.labelId === _id);
                  return (
                    <LabelPill
                      key={label._id}
                      focused={
                        isImageFocused &&
                        objIndex === focusIndex.object &&
                        lblIndex === focusIndex.label
                      }
                      onClick={(e) => handleLabelPillClick(e, objIndex, lblIndex)}
                      color={l?.color || '#00C797'}
                      name={l?.name || 'ERROR FINDING LABEL'}
                    />
                  );
                })}
              </ObjectPill>
            )}
          </div>
        );
      })}
    </LabelContainer>
  );
};

export default LabelPills;
