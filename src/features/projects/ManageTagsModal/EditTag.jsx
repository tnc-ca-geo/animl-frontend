import React, { useEffect, useState } from 'react';
import { SymbolIcon } from '@radix-ui/react-icons';
import IconButton from '../../../components/IconButton';
import { styled } from '../../../theme/stitches.config';
import { ColorPicker } from '../ManageLabelsModal/components';
import { Tooltip, TooltipArrow, TooltipTrigger, TooltipContent } from '../../../components/Tooltip';
import { getRandomColor, getTextColor } from '../../../app/utils';
import * as Yup from 'yup';
import Button from '../../../components/Button';
import { useSelector } from 'react-redux';
import { selectGlobalBreakpoint } from '../projectsSlice';
import { globalBreakpoints } from '../../../config';
import { Palette } from 'lucide-react';
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

const defaultColors = [
  '#E54D2E',
  '#E5484D',
  '#E93D82',
  '#D6409F',
  '#AB4ABA',
  '#8E4EC6',
  '#6E56CF',
  '#5B5BD6',
  '#3E63DD',
  '#0090FF',
  '#00A2C7',
  '#12A594',
  '#30A46C',
  '#46A758',
  '#A18072',
  '#F76B15',
  '#FFC53D',
  '#FFE629',
  '#BDEE63',
  '#7CE2FE',
  '#8D8D8D',
  '#F0F0F0',
];

const ColorPickerPopover = styled(PopoverContent, {
  borderRadius: '$2',
  padding: '$2',
  fontSize: '$3',
  lineHeight: 1,
  backgroundColor: '$hiContrast',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  color: '$textMedium',
});

const ColorSwatch = styled('button', {
  border: 'none',
  color: '$backgroundLight',
  height: '$4',
  width: '$4',
  margin: 2,
  borderRadius: '$2',
  '&:hover': {
    cursor: 'pointer',
  },
});

const createTagNameSchema = (currentName, allNames) => {
  return Yup.string()
    .required('Enter a tag name.')
    .matches(/^[a-zA-Z0-9_. -]*$/, "Tags can't contain special characters")
    .test('unique', 'A tag with this name already exists.', (val) => {
      const allNamesLowerCase = allNames.map((n) => n.toLowerCase());
      if (val?.toLowerCase() === currentName.toLowerCase()) {
        // name hasn't changed
        return true;
      } else if (!allNamesLowerCase.includes(val?.toLowerCase())) {
        // name hasn't already been used
        return true;
      } else {
        return false;
      }
    });
};

const tagColorSchema = Yup.string()
  .matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Enter a valid color code with 6 digits' })
  .required('Select a color.');

const EditContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  rowGap: '$1',
  '@bp2': {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
  },
  columnGap: '$3',
  marginBottom: '$3',
  marginTop: '$2',
  '& > *': {
    minWidth: 0,
  },
});

const EditFieldContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const EditFieldLabel = styled('label', {
  fontWeight: 'bold',
  color: '$textDark',
  fontSize: '$3',
});

const EditFieldInput = styled('input', {
  padding: '$2',
  width: '100%',
  '@bp2': {
    width: 'auto',
    padding: '$2 $3',
  },
  color: '$textMedium',
  fontFamily: '$sourceSansPro',
  border: '1px solid $border',
  borderRadius: '$1',
  minWidth: 0,
  variants: {
    focusDisabled: {
      true: {
        border: 'none',
        '&:focus': {
          outline: 'none',
          boxShadow: 'none',
        },
      },
      false: {
        '&:focus': {
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: '0 0 0 3px $gray3',
          // borderColor: '$textDark',
          '&:hover': {
            boxShadow: '0 0 0 3px $blue200',
            borderColor: '$blue500',
          },
        },
      },
    },
  },
});

const EditFieldError = styled('div', {
  color: '$errorText',
  fontSize: '$3',
});

const EditActionButtonsContainer = styled('div', {
  display: 'flex',
  gap: '$2',
  justifyContent: 'flex-end',
  width: '100%',
  marginTop: '$1',
  '@bp2': {
    margin: 'auto auto',
    marginBottom: '$2',
  },
});

const EditActionsButton = styled(Button, {
  flex: '1',
  '@bp2': {
    flex: 'unset',
  },
});

const PreviewTagContainer = styled('div', {
  display: 'flex',
  marginTop: '$2',
});

const PreviewTag = styled('div', {
  padding: '$1 $3',
  borderRadius: '$2',
  border: '1px solid rgba(0,0,0,0)',
  color: '$textDark',
  fontFamily: '$mono',
  fontWeight: 'bold',
  fontSize: '$2',
  display: 'grid',
  placeItems: 'center',
  marginLeft: '0',
  marginRight: 'auto',
  height: '$5',
});

const SmallScreenColorPicker = styled('div', {
  width: '100%',
  display: 'flex',
  border: '1px solid $border',
  borderRadius: '$1',
  '&:focus-within': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    // borderColor: '$textDark',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
});

const ColorPickerButton = styled(IconButton, {
  height: '100%',
  aspectRatio: '1/1',
  background: '$backgroundLight',
  borderRadius: '$1',
  margin: 'auto 0',
  marginRight: '$2',
});

export const EditTag = ({
  id,
  currentName,
  currentColor,
  onPreviewColor,
  allTagNames,
  onSubmit,
  onCancel,
  isNewLabel,
}) => {
  if (isNewLabel) {
    currentColor = `#${getRandomColor()}`;
    currentName = '';
  }

  // to get rid of warning for now
  const [name, setName] = useState(currentName);
  const [color, setColor] = useState(currentColor);
  const [tempColor, setTempColor] = useState(currentColor);

  const [nameError, setNameError] = useState('');
  const [colorError, setColorError] = useState('');

  const updateTempColor = (color) => {
    if (colorError !== '') {
      setColorError('');
    }
    setTempColor(color);
  };

  const updateColor = (newColor) => {
    setTempColor(newColor);
    setColor(newColor);
    if (onPreviewColor) {
      onPreviewColor(newColor);
    }
    setColorError('');
  };

  const updateName = (name) => {
    if (nameError !== '') {
      setNameError('');
    }
    setName(name);
  };

  const onCancelEdit = () => {
    setName(currentName);
    setColor(currentColor);
    setTempColor(currentColor);
    onCancel();
  };

  const onConfirmEdit = () => {
    let validatedName = '';
    let validatedColor = '';

    const tagNameSchema = createTagNameSchema(currentName, allTagNames);

    // If the user typed in a color, tempColor !== color
    const submittedColor = tempColor !== color ? tempColor : color;
    try {
      validatedColor = tagColorSchema.validateSync(submittedColor);
    } catch (err) {
      setColorError(err.message);
    }

    try {
      validatedName = tagNameSchema.validateSync(name);
    } catch (err) {
      setNameError(err.message);
    }

    if (validatedName === '' || validatedColor === '') {
      return;
    }

    if (isNewLabel) {
      onSubmit(validatedName, validatedColor);
    } else {
      onSubmit(id, validatedName, validatedColor);
    }
  };

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  useEffect(() => {
    console.log(isColorPickerOpen);
  }, [isColorPickerOpen]);

  return (
    <>
      {isNewLabel && (
        <PreviewTagContainer>
          <PreviewTag
            css={{
              borderColor: color,
              backgroundColor: `${color}1A`,
            }}
          >
            {!name ? 'new tag' : name}
          </PreviewTag>
        </PreviewTagContainer>
      )}
      <EditContainer>
        <EditFieldContainer>
          <EditFieldLabel>Name</EditFieldLabel>
          <EditFieldInput value={name} onChange={(e) => updateName(e.target.value)} />
          <EditFieldError>{nameError}</EditFieldError>
        </EditFieldContainer>
        <EditFieldContainer>
          <EditFieldLabel>Color</EditFieldLabel>
          <ColorPicker>
            {!isSmallScreen ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButton
                      type="button"
                      aria-label="Get a new color"
                      size="md"
                      onClick={() => updateColor(`#${getRandomColor()}`)}
                      css={{
                        backgroundColor: color,
                        borderColor: color,
                        color: getTextColor(color),
                        '&:hover': {
                          borderColor: color,
                        },
                        '&:active': {
                          borderColor: '$border',
                        },
                      }}
                    >
                      <SymbolIcon />
                    </IconButton>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={5}>
                    Get a new color
                    <TooltipArrow />
                  </TooltipContent>
                </Tooltip>
                <Tooltip onOpenChange={setIsColorPickerOpen} open={isColorPickerOpen}>
                  <TooltipTrigger asChild>
                    <EditFieldInput
                      value={tempColor}
                      onChange={(e) => updateTempColor(`${e.target.value}`)}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={5}
                    css={{
                      maxWidth: 324,
                      padding: '$2',
                      color: '$textMedium',
                      backgroundColor: 'white',
                    }}
                  >
                    <div style={{ paddingBottom: '3px' }}>Choose from default colors:</div>
                    {defaultColors.map((color) => (
                      <ColorSwatch
                        key={color}
                        css={{ backgroundColor: color }}
                        type="button"
                        onClick={() => updateColor(color)}
                      />
                    ))}
                    <TooltipArrow css={{ fill: 'white' }} />
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <IconButton
                  type="button"
                  aria-label="Get a new color"
                  size="md"
                  onClick={() => updateColor(`#${getRandomColor()}`)}
                  css={{
                    backgroundColor: color,
                    borderColor: color,
                    color: getTextColor(color),
                    '&:hover': {
                      borderColor: color,
                    },
                    '&:active': {
                      borderColor: '$border',
                    },
                  }}
                >
                  <SymbolIcon />
                </IconButton>
                <Popover>
                  <SmallScreenColorPicker>
                    <EditFieldInput
                      value={tempColor}
                      onChange={(e) => updateTempColor(`${e.target.value}`)}
                      focusDisabled={true}
                    />
                    <PopoverTrigger asChild>
                      <ColorPickerButton
                        variant="ghost"
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                      >
                        <Palette strokeWidth={1.25} />
                      </ColorPickerButton>
                    </PopoverTrigger>
                    <ColorPickerPopover
                      side="top"
                      sideOffset={5}
                      style={{
                        maxWidth: 324,
                        padding: '$2',
                        backgroundColor: 'white',
                      }}
                    >
                      <div style={{ paddingBottom: '3px' }}>Choose from default colors:</div>
                      {defaultColors.map((color) => (
                        <ColorSwatch
                          key={color}
                          css={{ backgroundColor: color }}
                          type="button"
                          onClick={() => updateColor(color)}
                        />
                      ))}
                      <PopoverArrow style={{ fill: 'white' }} />
                    </ColorPickerPopover>
                  </SmallScreenColorPicker>
                </Popover>
              </>
            )}
          </ColorPicker>
          <EditFieldError>{colorError}</EditFieldError>
        </EditFieldContainer>
        <EditFieldContainer>
          <EditActionButtonsContainer>
            <EditActionsButton
              size="small"
              type="button"
              disabled={!name}
              onClick={() => onConfirmEdit()}
            >
              Save
            </EditActionsButton>
            <EditActionsButton size="small" type="button" onClick={() => onCancelEdit(false)}>
              Cancel
            </EditActionsButton>
          </EditActionButtonsContainer>
        </EditFieldContainer>
      </EditContainer>
    </>
  );
};
