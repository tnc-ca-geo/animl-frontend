import React, { useState, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { labelsAdded, setFocus } from '../review/reviewSlice.js';
import { addLabelStart, addLabelEnd, selectIsAddingLabel } from './loupeSlice.js';
import ValidationButtons from './ValidationButtons.jsx';
import CategorySelector from '../../components/CategorySelector.jsx';
import { getTextColor } from '../../app/utils.js';

const StyledBoundingBoxLabel = styled('div', {
  // backgroundColor: '#345EFF',
  fontFamily: '$mono',
  fontSize: '$2',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  width: 'max-content',
  zIndex: '$3',
  variants: {
    verticalPos: {
      top: {
        top: '-26px',
      },
      bottom: {
        top: '-2px',
      },
    },
    horizontalPos: {
      left: {
        left: '-2px',
      },
      right: {
        right: '-2px',
      },
    },
    catSelectorOpen: {
      true: {
        top: '-32px',
        padding: '0',
      },
    },
    selected: {
      true: {
        // opacity: '1',
        zIndex: '$4',
      },
      false: {
        // opacity: '1',
      },
    },
  },
});

const Category = styled('span', {
  // paddingRight: '$2',
});

const Confidence = styled('span', {
  paddingLeft: '$2',
});

const LabelDisplay = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '$1 $2',
});

const BoundingBoxLabel = forwardRef(function BoundingBoxLabel(
  {
    imgId,
    index,
    object,
    label,
    displayLabel,
    conf,
    selected,
    showLabelButtons,
    setTempObject,
    verticalPos,
    horizontalPos,
    isAuthorized,
    username,
  },
  ref,
) {
  const dispatch = useDispatch();

  // manage category selector state (open/closed)
  const isAddingLabel = useSelector(selectIsAddingLabel);
  const open = isAddingLabel === 'from-object' && selected;
  const [catSelectorOpen, setCatSelectorOpen] = useState(open);
  useEffect(() => {
    setCatSelectorOpen(isAddingLabel === 'from-object' && selected);
  }, [isAddingLabel, selected]);

  // manually focus catSelector if it's open
  useEffect(() => {
    if (catSelectorOpen) ref.current.focus();
  }, [ref, catSelectorOpen]);

  const handleLabelClick = (e) => {
    e.stopPropagation();
    if (!object.locked && isAuthorized && !catSelectorOpen) {
      dispatch(setFocus({ index, type: 'manual' }));
      dispatch(addLabelStart('from-object'));
    }
  };

  const handleCategoryChange = (newValue) => {
    if (!newValue) return;
    setTempObject(null);
    dispatch(
      labelsAdded({
        labels: [
          {
            objIsTemp: object.isTemp,
            userId: username,
            bbox: object.bbox,
            labelId: newValue.value,
            objId: object._id,
            imgId,
          },
        ],
      }),
    );
  };

  const handleCategorySelectorBlur = () => {
    if (object.isTemp) setTempObject(null);
    dispatch(addLabelEnd());
  };

  return (
    <StyledBoundingBoxLabel
      verticalPos={verticalPos}
      horizontalPos={horizontalPos}
      catSelectorOpen={catSelectorOpen}
      selected={selected}
      css={{ backgroundColor: displayLabel?.color }}
    >
      <div onClick={handleLabelClick}>
        <CategorySelector
          css={{ display: catSelectorOpen ? 'block' : 'none' }}
          ref={ref}
          handleCategoryChange={handleCategoryChange}
          handleCategorySelectorBlur={handleCategorySelectorBlur}
          menuPlacement="bottom"
        />
        <LabelDisplay css={{ display: catSelectorOpen ? 'none' : 'block', color: getTextColor(displayLabel?.color) }}>
          <Category>{displayLabel?.name || 'ERROR FINDING LABEL'}</Category>
          {!object.locked && <Confidence>{conf}%</Confidence>}
        </LabelDisplay>
      </div>
      {showLabelButtons && !catSelectorOpen && isAuthorized && (
        <ValidationButtons
          imgId={imgId}
          object={object}
          label={label}
          labelColor={displayLabel?.color}
          username={username}
        />
      )}
    </StyledBoundingBoxLabel>
  );
});

export default BoundingBoxLabel;
