import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { selectImages, selectImagesCount } from '../images/imagesSlice';
import {
  loupeClosed,
  incrementIndex, 
  iterationUnitChanged,
  selectIndex,
  selectIterationUnit,
  selectLabelsIndex,
} from './loupeSlice';
import PanelHeader from '../../components/PanelHeader';
import FullSizeImage from './FullSizeImage';

const IndexDisplay = styled.div({
  fontFamily: '$mono',
  fontSize: '$3',
  fontWeight: '$1',
  marginRight: '$3',
  // minWidth: '200px',
  display: 'flex',
  alignItems: 'center',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '160px',
});

const Index = styled('span', {
  color: '$hiContrast',
  marginRight: '$3',
})

const IndexUnit = styled('span', {
  color: '$gray600',
});

// TODO: a lot of these styling overrides are redundant 
const IterationUnitSelector = styled(Select, {
  width: '155px',
  fontFamily: '$mono',
  fontSize: '$3',
  fontWeight: '$1',
  marginRight: '$4',
  '.react-select__control': {
    boxSizing: 'border-box',
    border: '$1 solid',
    borderColor: '$gray400',
    borderRadius: '$1',
    cursor: 'pointer',
  },
  '.react-select__indicator-separator': {
    display: 'none',
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

const ProgressBar = styled.div({
  height: '$1',
  width: '100%',
  backgroundColor: '$gray300',
  position: 'relative',
  borderRadius: '$2',
});

const ProgressIndicator = styled.span({
  backgroundColor: '$blue600',
  height: '$1',
  position: 'absolute',
  display: 'block',
  borderRadius: '$2',
});

const ProgressDisplay = styled.div({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  paddingRight: '$2',
})

// const LabelsPane = styled.div({
//   padding: '$3',
// });

const ItemValue = styled.div({
  fontSize: '$3',
  fontFamily: '$mono',
  color: '$hiContrast',
});

const ItemLabel = styled.div({
  fontSize: '$3',
  color: '$gray600',
  marginBottom: '$2',
});

const StyledItem = styled.div({
  marginBottom: '$3',
  marginRight: '$4',
});

const Item = ({label, value}) => (
  <StyledItem>
    <ItemLabel>{label}</ItemLabel>
    <ItemValue>{value}</ItemValue>
  </StyledItem>
);

const MetadataList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
});

const MetadataPane = styled.div({
  padding: '$3 0',
  marginBottom: '$6',
});

const StyledInfoPaneHeader = styled.div({
  fontSize: '$5',
  fontWeight: '$5',
  paddingBottom: '$2',
  borderBottom: '$1 solid $gray400',
  marginBottom: '$3',
  'span': {
    paddingBottom: '$2',
    borderBottom: '$1 solid $gray600',
  },
});

const InfoPaneHeader = ({ label }) => (
  <StyledInfoPaneHeader>
    <span>{label}</span>
  </StyledInfoPaneHeader>
);

const ImagePane = styled.div({
  background: 'aliceblue',
});

const LoupeBody = styled.div({
  flexGrow: 1,
  display: 'grid',
  margin: '$3',
});

const StyledLoupe = styled.div({
  boxSizing: 'border-box',
  width: 'calc(100% - 810px)',
  height: 'calc(100% - 56px)',
  position: 'absolute',
  backgroundColor: '$loContrast',
  borderLeft: '$1 solid $gray400',
  marginLeft: '100%',
  // transition: 'margin-left 0.3s ease-out',

  variants: {
    expanded: {
      true: {
        marginLeft: '745px',
      },
    }
  }

});

const key = {
  left: 37,
  right: 39,
  up: 38,
  down: 40,
};

const Loupe = ({ expanded }) => {
  const imageCount = useSelector(selectImagesCount);
  const index = useSelector(selectIndex);
  const images = useSelector(selectImages);
  const [ image, setImage ] = useState(images[index.images]);

  const progress = (index.images / imageCount) * 100;
  const iterationUnit = useSelector(selectIterationUnit);
  // const labels = useSelector(selectLabelsIndex);

  const [ reviewMode, setReviewMode ] = useState(false);
  const dispatch = useDispatch();
  const iterationOptions = [
    { value: 'images', label: 'images' },
    { value: 'labels', label: 'labels' },
  ];

  // Listen for arrow keydowns
  useEffect(() => {
    const handleKeyDown = (e) => {

      const delta = (e.keyCode === key.up) ? 'decrement'
                  : (e.keyCode === key.down) ? 'increment'
                  : null;

      if (delta) {
        dispatch(incrementIndex({ unit: iterationUnit, delta })); 
      }

      if (iterationUnit === 'labels') {
        if (e.keyCode === key.right) {
          // TODO: validate label
          // dispatch(labelValidated({ delta })); 
        }
        if (e.keyCode === key.left) {
          // TODO: invalidate label
          // dispatch(labelValidated({ delta })); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ iterationUnit, reviewMode, dispatch ]);

  useEffect(() => {
    setImage(images[index.images]);
  }, [images, index.images])

  const handleToggleReviewMode = () => setReviewMode(!reviewMode);

  const handleLoupeClose = () => dispatch(loupeClosed());

  const handleIterationUnitChange = (value) => {
    dispatch(iterationUnitChanged(value.value));
  };

  return (
    <StyledLoupe expanded={expanded}>
      <PanelHeader handlePanelClose={handleLoupeClose}>
        <ProgressDisplay>
          <IterationUnitSelector
            value={{ value: iterationUnit, label: iterationUnit }}
            options={iterationOptions}
            onChange={handleIterationUnitChange}
            className='react-select'
            classNamePrefix='react-select'
          />
          <IndexDisplay>
            <Index>{index.images + 1} / {imageCount}</Index>
            <IndexUnit>images</IndexUnit>
          </IndexDisplay>
          <ProgressBar>
            <ProgressIndicator css={{ width: progress + `%` }} />
          </ProgressBar>
        </ProgressDisplay>
      </PanelHeader>
      <LoupeBody className={expanded ? 'expanded' : null}>
        {image &&
          <div>
            <ImagePane>
              <FullSizeImage image={image} loupeIndex={index} />
            </ImagePane>
            <MetadataPane>
              <InfoPaneHeader label='Metadata' />
              <MetadataList>
                <Item label='Date created' value={image.dateTimeOriginal}/>
                <Item label='Camera' value={image.cameraSn}/>
                <Item label='Camera make' value={image.make}/>
                <Item label='File name' value={image.originalFileName}/>
              </MetadataList>
            </MetadataPane>
          </div>
        }
      </LoupeBody>
    </StyledLoupe>
  );
};

export default Loupe;
