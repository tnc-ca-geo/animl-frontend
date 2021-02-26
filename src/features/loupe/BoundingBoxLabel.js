import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import CreatableSelect from 'react-select/creatable';
import { selectAvailLabels } from '../filters/filtersSlice';
import { incrementIndex } from '../loupe/loupeSlice';
import { labelAdded } from '../images/imagesSlice';

const StyledBoundingBoxLabel = styled('div', {
  backgroundColor: '#345EFF',
  color: '$loContrast',
  fontFamily: '$mono',
  fontSize: '$2',
  padding: '$1 $2',
  position: 'absolute',
  width: 'max-content',
  variants: {
    verticalPos: {
      top: {
        top: '-25px',
        // backgroundColor: 'papayawhip'
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
    }
  }
});

const Category = styled('div', {

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

// TODO: 
//  - Add buttons for validate, invalidate, unlock

const BoundingBoxLabel = (props) => {
  const { index, label, labelColor, conf, selected } = props;
  const [ options, setOptions ] = useState();
  const availLabels = useSelector(selectAvailLabels);
  const dispatch = useDispatch();

  const createOption = (category) => ({
    label: category,
    value: category.toLowerCase().replace(/\W/g, ''),
  });

  useEffect(() => {
    const newOptions = availLabels.categories.map((cat) => createOption(cat));
    setOptions(newOptions);
  }, [ availLabels ]);

  const [ catSelectorOpen, setCatSelectorOpen ] = useState(false);
  useEffect(() => {
    const handleWindowClick = (e) => setCatSelectorOpen(false);
    catSelectorOpen
      ? window.addEventListener('click', handleWindowClick)
      : window.removeEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [ catSelectorOpen, setCatSelectorOpen ]);

  useEffect(() => {
    setCatSelectorOpen(false);
  }, [ label ])

  // listen for ctrl-e keydown (open cat selector to edit)
  useEffect(() => {
    // TODO: should be able to use react synthetic onKeyDown events,
    // but couldn't get it working 
    const handleKeyDown = (e) => {
      let charCode = String.fromCharCode(e.which).toLowerCase();
      if (selected && (e.ctrlKey || e.metaKey) && charCode === 'e') {
        setCatSelectorOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ selected ]);


  const handleCategoryClick = (e) => {
    e.stopPropagation();
    setCatSelectorOpen(true);
  };

  const handleCategoryChange = (newValue) => {
    if (newValue) {
      dispatch(labelAdded({category: newValue.value, index}));
      dispatch(incrementIndex('increment'));
    }
  };

  const handleCategoryCreate = (inputValue) => {
    if (inputValue) {
      dispatch(labelAdded({ category: inputValue, index }));
      dispatch(incrementIndex('increment'));
    }
  };

  return (
    <StyledBoundingBoxLabel
      verticalPos={props.verticalPos}
      horizontalPos={props.horizontalPos}
      catSelectorOpen={catSelectorOpen}
      css={{
        backgroundColor: labelColor.primary,
        color: labelColor.text
      }}
    >
      <Category
        onClick={handleCategoryClick}
      >
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
          : <div>{label.category} {conf} %</div>
        }
      </Category>
    </StyledBoundingBoxLabel>
  );
};

export default BoundingBoxLabel;

