import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import CreatableSelect from 'react-select/creatable';
import { selectAvailLabels } from '../filters/filtersSlice';
import { selectUserUsername } from '../user/userSlice.js';
import {
  labelAdded,
  objectRemoved,
  setFocus,
} from '../review/reviewSlice';
import {
  addLabelStart,
  addLabelEnd,
  selectIsAddingLabel
} from './loupeSlice';
import ValidationButtons from './ValidationButtons.js';
import { truncate } from 'lodash';

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
        top: '-24px',
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
    borderColor: '$gray400',
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
    color: '$hiContrast',
    fontSize: '$3',
    '.react-select__option': {
      cursor: 'pointer',
    },
    '.react-select__option--is-selected': {
      color: '$blue500',
      backgroundColor: '$blue200',
    },
    '.react-select__option--is-focused': {
      backgroundColor: '$gray300',
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
  setShowLabelButtons,
  setTempObject,
  verticalPos,
  horizontalPos, 
}) => {
  const username = useSelector(selectUserUsername);
  const dispatch = useDispatch();

  // update selctor options when new labels become available
  const [ options, setOptions ] = useState();
  const availLabels = useSelector(selectAvailLabels);
  const createOption = (category) => ({
    label: category,
    value: category.toLowerCase().replace(/\W/g, ''),
  });
  useEffect(() => {
    const newOptions = availLabels.ids.map((id) => createOption(id));
    setOptions(newOptions);
  }, [ availLabels ]);

  // manage catagory selector state (open/closed)
  const addingLabel = useSelector(selectIsAddingLabel);
  const [ catSelectorOpen, setCatSelectorOpen ] = useState(false);
  useEffect(() => {
    setCatSelectorOpen((addingLabel && selected));
  }, [ addingLabel, selected ]);

  // stop adding label if user clicks out of it
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (object.isTemp) {
        // TODO: remove temp object
        // dispatch(objectRemoved({ imgId, objId: object._id }));
        setTempObject(null);
      }
      dispatch(addLabelEnd());
    }
    addingLabel
      ? window.addEventListener('click', handleWindowClick)
      : window.removeEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [ addingLabel, imgId, object, setTempObject, dispatch ]);

  // listen for ctrl-e keydown and open cat selector to edit
  useEffect(() => {
    // TODO: should be able to use react synthetic onKeyDown events,
    // but couldn't get it working
    const handleKeyDown = (e) => {
      let charCode = String.fromCharCode(e.which).toLowerCase();
      if (selected && (e.ctrlKey || e.metaKey) && charCode === 'e') {
        dispatch(addLabelStart());
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ selected, dispatch ]);

  const handleLabelClick = (e) => {
    e.stopPropagation();
    if (!object.locked && !catSelectorOpen) {
      dispatch(setFocus({ index, type: 'manual' }));
      dispatch(addLabelStart());
    }
  };

  const handleCategoryChange = (newValue) => {
    if (newValue) {
      setTempObject(null);
      dispatch(labelAdded({
        objIsTemp: object.isTemp,
        category: newValue.value,
        userId: username,
        bbox: object.bbox,
        objId: object._id,
        imgId,
      }));
    }
  };

  const handleCategoryCreate = (inputValue) => {
    if (inputValue) {
      setTempObject(null);
      dispatch(labelAdded({
        objIsTemp: object.isTemp,
        category: inputValue,
        userId: username,
        bbox: object.bbox,
        objId: object._id,
        imgId,
      }));
    }
  };

  return (
    <StyledBoundingBoxLabel
      verticalPos={verticalPos}
      horizontalPos={horizontalPos}
      catSelectorOpen={catSelectorOpen}
      selected={selected}
      css={{
        backgroundColor: labelColor.primary,
        color: labelColor.text
      }}
    >
      <div onClick={handleLabelClick}>
        {catSelectorOpen
          ? <CategorySelector
              autoFocus
              isClearable
              isSearchable
              className='react-select'
              classNamePrefix='react-select'
              isLoading={availLabels.isLoading}
              isDisabled={availLabels.isLoading}
              onChange={handleCategoryChange}
              onCreateOption={handleCategoryCreate}
              value={createOption(label.category)}
              options={options}
            />
          : <LabelDisplay>
              <Category>{label.category}</Category>
              {!object.locked && <Confidence>{conf}%</Confidence>}
            </LabelDisplay>
        }
      </div>
      {(showLabelButtons && !catSelectorOpen) &&
        <ValidationButtons 
          imgId={imgId}
          object={object}
          label={label}
          labelColor={labelColor}
          username={username}
          setShowLabelButtons={setShowLabelButtons}
        />
      }
    </StyledBoundingBoxLabel>
  );
};

export default BoundingBoxLabel;

