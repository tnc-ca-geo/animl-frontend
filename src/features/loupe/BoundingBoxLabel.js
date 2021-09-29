import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import CreatableSelect from 'react-select/creatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { selectUserUsername } from '../user/userSlice.js';
import { selectAvailLabels } from '../filters/filtersSlice';
import {
  labelAdded,
  labelValidated,
  objectRemoved,
  objectLocked,
  setFocus,
} from '../review/reviewSlice';
import {
  addLabelStart,
  addLabelEnd,
  selectIsAddingLabel
} from './loupeSlice';

const StyledBoundingBoxLabel = styled('div', {
  backgroundColor: '#345EFF',
  color: '$loContrast',
  fontFamily: '$mono',
  fontSize: '$2',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  width: 'max-content',
  zIndex: '$4',
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
        opacity: '1',
      },
      false: {
        opacity: '0.75',
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

const LabelButton = styled('button', {
  padding: '0',
  width: '26px',
  height: '24px',
  borderRadius: '0px',
  border: '2px solid',
  // borderBottom: '1px solid',
  borderLeft: '1px solid',
  '&:hover': {
    cursor: 'pointer',
  },
});

const LabelButtons = styled('div', {
  position: 'relative',
  // right: '0',
  // top: '0',
});

const CategorySelector = styled(CreatableSelect, {
  width: '155px',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '$1',
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

const BoundingBoxLabel = (props) => {
  const {
    focusIndex,
    objectIndex,
    labelIndex,
    object,
    label,
    labelColor,
    conf,
    selected,
    showLabelButtons,
    setShowLabelButtons 
  } = props;
  const username = useSelector(selectUserUsername);
  const dispatch = useDispatch();
  const index = {
    image: focusIndex.image,  
    object: objectIndex,
    label: labelIndex
  };

  // update selctor options when new labels become available
  const [ options, setOptions ] = useState();
  const availLabels = useSelector(selectAvailLabels);
  const createOption = (category) => ({
    label: category,
    value: category.toLowerCase().replace(/\W/g, ''),
  });
  useEffect(() => {
    const newOptions = availLabels.categories.map((cat) => createOption(cat));
    setOptions(newOptions);
  }, [ availLabels ]);

  // manage catagory selector state (open/closed)
  const addingLabel = useSelector(selectIsAddingLabel);
  const [ catSelectorOpen, setCatSelectorOpen ] = useState(false);
  useEffect(() => {
    setCatSelectorOpen((addingLabel && selected))
  }, [ addingLabel, selected ]);
  
  // stop adding label if user clicks out of it
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (object.isBeingAdded) {
        dispatch(objectRemoved({ imageIndex: focusIndex.image, objectIndex }))
      }
      dispatch(addLabelEnd());
    }
    addingLabel
      ? window.addEventListener('click', handleWindowClick)
      : window.removeEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [ addingLabel, object, objectIndex, focusIndex, dispatch ]);

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

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    if (!object.locked && !catSelectorOpen) {
      dispatch(setFocus(index));
      dispatch(addLabelStart());
    }
  };

  const handleCategoryChange = (newValue) => {
    if (newValue) {
      const payload = {
        category: newValue.value,
        userId: username,
        index
      };
      dispatch(labelAdded(payload));
    }
  };

  const handleCategoryCreate = (inputValue) => {
    if (inputValue) {
      const payload = {
        category: inputValue,
        userId: username,
        index
      };
      dispatch(labelAdded(payload));
    }
  };

  const handleLockButtonClick = (e) => {
    e.stopPropagation();
    dispatch(objectLocked({ index, locked: false }));
  };

  const handleValidationButtonClick = (e, validated) => {
    e.stopPropagation();
    const payload = {
      userId: username,
      index,
      validated,
    };
    dispatch(labelValidated(payload));
    setShowLabelButtons(false);
  };

  return (
    <StyledBoundingBoxLabel
      verticalPos={props.verticalPos}
      horizontalPos={props.horizontalPos}
      catSelectorOpen={catSelectorOpen}
      selected={selected}
      css={{
        backgroundColor: labelColor.primary,
        color: labelColor.text
      }}
    >
      <div onClick={handleCategoryClick}>
        {catSelectorOpen
          ? <CategorySelector
              autoFocus
              isClearable
              isSearchable
              isDisabled={availLabels.isLoading}
              isLoading={availLabels.isLoading}
              onChange={handleCategoryChange}
              onCreateOption={handleCategoryCreate}
              options={options}
              value={createOption(label.category)}
              className='react-select'
              classNamePrefix='react-select'
            />
          : <LabelDisplay>
              <Category>{label.category}</Category>
              {!object.locked && <Confidence>{conf}%</Confidence>}
            </LabelDisplay>
        }
      </div>
      {(showLabelButtons && !catSelectorOpen) &&
        <LabelButtons>
          {object.locked
            ? <LabelButton
                onClick={handleLockButtonClick}
                css={{
                  color: '$loContrast',
                  backgroundColor: labelColor.primary,
                  borderColor: labelColor.primary,
                  '&:hover': {
                    backgroundColor: '$loContrast',
                    color: '$hiContrast',
                  }
              }}>
                <FontAwesomeIcon icon={['fas', 'unlock']}/>
              </LabelButton>              
            : <>
                <LabelButton
                  onClick={(e) => handleValidationButtonClick(e, false)}
                  css={{
                    backgroundColor: '#E04040',
                    color: '$loContrast',
                    borderColor: labelColor.primary,
                    '&:hover': {
                      color: '#E04040',
                      backgroundColor: '$loContrast',
                      borderColor: labelColor.primary,
                    }
                  }}
                >
                  <FontAwesomeIcon icon={['fas', 'times']} />
                </LabelButton>
                <LabelButton
                  onClick={(e) => handleValidationButtonClick(e, true)}
                  css={{
                    backgroundColor: '#00C797',
                    color: '$loContrast',
                    borderColor: labelColor.primary,
                    '&:hover': {
                      color: '#00C797',
                      backgroundColor: '$loContrast',
                      borderColor: labelColor.primary,
                    }
                  }}
                >
                  <FontAwesomeIcon icon={['fas', 'check']} />
                </LabelButton>
              </>
            }
        </LabelButtons>
      }
    </StyledBoundingBoxLabel>
  );
};

export default BoundingBoxLabel;

