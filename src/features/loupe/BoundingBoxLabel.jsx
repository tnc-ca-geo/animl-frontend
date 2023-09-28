import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import CreatableSelect from 'react-select/creatable';
import { createFilter } from 'react-select';
import { selectAvailLabels } from '../filters/filtersSlice.js';
import { labelsAdded, setFocus } from '../review/reviewSlice.js';
import { addLabelStart, addLabelEnd, selectIsAddingLabel } from './loupeSlice.js';
import ValidationButtons from './ValidationButtons.jsx';

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
      }
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
      }
    },
    selected: {
      true: {
        // opacity: '1',
        zIndex: '$4',
      },
      false: {
        // opacity: '1',
      }
    }
  }
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

const CategorySelector = styled(CreatableSelect, {
  width: '155px',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '$1',
  zIndex: '$5',
  '.react-select__control': {
    boxSizing: 'border-box',
    // height: '24px',
    minHeight: 'unset',
    border: '1px solid',
    borderColor: '$border',
    borderRadius: '0',
    cursor: 'pointer',
  },
  '.react-select__single-value': {
    // position: 'relative',
  },
  '.react-select__indicator-separator': {
    display: 'none',
  },
  '.react-select__dropdown-indicator': {
    paddingTop: '0',
    paddingBottom: '0',
  },
  '.react-select__control--is-focused': {
    transition: 'all 0.2s ease',
    boxShadow: '0 0 0 3px $blue200',
    borderColor: '$blue500',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
  '.react-select__menu': {
    color: '$textDark',
    fontSize: '$3',
    '.react-select__option': {
      cursor: 'pointer',
    },
    '.react-select__option--is-selected': {
      color: '$blue500',
      backgroundColor: '$blue200',
    },
    '.react-select__option--is-focused': {
      backgroundColor: '$gray3',
    },
  }
});

const BoundingBoxLabel = ({
  imgId,
  index,
  object,
  label,
  labelColor,
  conf,
  selected,
  showLabelButtons,
  setTempObject,
  verticalPos,
  horizontalPos,
  catSelectorRef,
  isAuthorized,
  username,
}) => {
  const textColor = labelColor.isLowContrast ? labelColor.textDark : labelColor.textLight;
  const dispatch = useDispatch();

  // update selector options when new labels become available
  const createOption = (category) => ({
    value: category.toLowerCase(),
    label: category,
  });
  const availLabels = useSelector(selectAvailLabels);
  const options = availLabels.ids.map((id) => createOption(id));

  // manage category selector state (open/closed)
  const addingLabel = useSelector(selectIsAddingLabel);
  const catSelectorOpen = (addingLabel && selected);

  // manually focus catSelector if it's open
  useEffect(() => {
    if (catSelectorOpen) catSelectorRef.current.focus();
  }, [catSelectorRef, catSelectorOpen])

  // // stop adding label if user clicks out of it
  // useEffect(() => {
  //   const handleWindowClick = (e) => {
  //     if (object.isTemp) setTempObject(null);
  //     // unless the last click was on the "edit label" context menu item
  //     if (!targetIsEditLabelMenuItem(e)) { 
  //       dispatch(addLabelEnd());
  //     }
  //   };
  //   addingLabel
  //     ? window.addEventListener('click', handleWindowClick)
  //     : window.removeEventListener('click', handleWindowClick);
  //   return () => window.removeEventListener('click', handleWindowClick);
  // }, [ addingLabel, imgId, object, setTempObject, dispatch ]);

  // listen for ctrl-e keydown and open cat selector to edit
  useEffect(() => {
    const handleKeyDown = (e) => {
      let charCode = String.fromCharCode(e.which).toLowerCase();
      if (((e.ctrlKey || e.metaKey) && charCode === 'e') &&
          isAuthorized &&
          selected
        ) {
        dispatch(addLabelStart());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ isAuthorized, selected, dispatch ]);

  const handleLabelClick = (e) => {
    e.stopPropagation();
    if (!object.locked && isAuthorized && !catSelectorOpen) {
      dispatch(setFocus({ index, type: 'manual' }));
      dispatch(addLabelStart());
    }
  };

  const handleCategoryChange = (newValue) => {
    if (!newValue) return;
    setTempObject(null);
    dispatch(labelsAdded({
      labels: [{
        objIsTemp: object.isTemp,
        userId: username,
        bbox: object.bbox,
        category: newValue.value || newValue,
        objId: object._id,
        imgId
      }]
    }));
  };

  const handleCategorySelectorBlur = (e) => {
    if (object.isTemp) setTempObject(null);
    dispatch(addLabelEnd());
  };

  return (
    <StyledBoundingBoxLabel
      verticalPos={verticalPos}
      horizontalPos={horizontalPos}
      catSelectorOpen={catSelectorOpen}
      selected={selected}
      css={{
        backgroundColor: labelColor.base,
        color: textColor,// labelColor.bg  
      }}
    >
      <div onClick={handleLabelClick}>
        <CategorySelector
          autoFocus
          isClearable
          isSearchable
          className='react-select'
          classNamePrefix='react-select'
          ref={catSelectorRef}
          filterOption={createFilter({ matchFrom: 'start' })}
          isLoading={availLabels.isLoading}
          isDisabled={availLabels.isLoading || !isAuthorized}
          onChange={handleCategoryChange}
          onCreateOption={handleCategoryChange}
          onBlur={handleCategorySelectorBlur}
          value={createOption(label.category)}
          options={options}
          css={{ display: catSelectorOpen ? 'block' : 'none' }}
        />
        <LabelDisplay
          css={{ display: catSelectorOpen ? 'none' : 'block' }}
        >
          <Category>{label.category}</Category>
          {!object.locked && <Confidence>{conf}%</Confidence>}
        </LabelDisplay>
      </div>
      {(showLabelButtons && !catSelectorOpen && isAuthorized) &&
        <ValidationButtons 
          imgId={imgId}
          object={object}
          label={label}
          labelColor={labelColor}
          username={username}
        />
      }
    </StyledBoundingBoxLabel>
  );
};

const targetIsEditLabelMenuItem = (e) => {
  let isEditLabelMenuItem = false;
  const composedPath = e.composedPath();
  composedPath.forEach((el) => {
    if (el.classList && 
        el.classList.contains('edit-label-menu-item')) {
      isEditLabelMenuItem = true;
    }
  });
  return isEditLabelMenuItem;
};

export default BoundingBoxLabel;

