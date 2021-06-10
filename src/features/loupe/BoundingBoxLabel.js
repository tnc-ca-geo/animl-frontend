import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import CreatableSelect from 'react-select/creatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { selectAvailLabels } from '../filters/filtersSlice';
import {
  labelAdded,
  labelValidated,
  objectRemoved,
  objectLocked
} from '../review/reviewSlice';
import { addLabelStart, addLabelEnd } from './loupeSlice';

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
        opacity: '0.5',
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
  ':hover': {
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
    border: '$1 solid',
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
    ':hover': {
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
  // TODO: tidy up props
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
  const dispatch = useDispatch();
  const index = {
    image: focusIndex.image,  
    object: objectIndex,
    label: labelIndex
  };

  useEffect(() => {
    console.log('rendering BoundingBoxLabel')
  }, [])

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

  // open category selector if it doesn't have a label yet
  // i.e. - user just added an object
  const [ catSelectorOpen, setCatSelectorOpen ] = useState();
  useEffect(() => {
    if (object.isBeingAdded && object.labels.length === 0) {
      dispatch(addLabelStart());
      setCatSelectorOpen(true);
    } else {
      // TODO: figure out why this is firing so much and fix it
      console.log('addLabelEnd - from cat selector open useEffect')
      dispatch(addLabelEnd());
      setCatSelectorOpen(false);
    }
  }, [ object, label, selected, dispatch ]);

  // close category selector if user clicks outside of it
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (object.isBeingAdded) {
        dispatch(objectRemoved({ imageIndex: focusIndex.image, objectIndex }))
      }
      console.log('addLabelEnd - from cat selector close useEffect')
      dispatch(addLabelEnd());
      setCatSelectorOpen(false);
    }
    catSelectorOpen
      ? window.addEventListener('click', handleWindowClick)
      : window.removeEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [ catSelectorOpen, setCatSelectorOpen, object, focusIndex, objectIndex, 
    dispatch ]);

  // listen for ctrl-e keydown and open cat selector to edit
  useEffect(() => {
    // TODO: should be able to use react synthetic onKeyDown events,
    // but couldn't get it working
    const handleKeyDown = (e) => {
      let charCode = String.fromCharCode(e.which).toLowerCase();
      if (selected && (e.ctrlKey || e.metaKey) && charCode === 'e') {
        dispatch(addLabelStart());
        setCatSelectorOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ selected, dispatch ]);

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    if (!object.locked) {
      dispatch(addLabelStart());
      setCatSelectorOpen(true);
    }
  };

  const handleCategoryChange = (newValue) => {
    if (newValue) {
      dispatch(labelAdded({ category: newValue.value, index }));
    }
  };

  const handleCategoryCreate = (inputValue) => {
    if (inputValue) {
      dispatch(labelAdded({ category: inputValue, index }));
    }
  };

  const handleLockButtonClick = (e) => {
    e.stopPropagation();
    dispatch(objectLocked({ index, locked: false }));
  };

  // const [ showLabelButtons, setShowLabelButtons ] = useState();
  // const handleLabelMouseEnter = () => setShowLabelButtons(true);
  // const handleLabelMouseLeave = () => setShowLabelButtons(false);

  const handleValidationButtonClick = (e, validated) => {
    e.stopPropagation();
    dispatch(labelValidated({ index, validated }));
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
                  ':hover': {
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
                    ':hover': {
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
                    ':hover': {
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

