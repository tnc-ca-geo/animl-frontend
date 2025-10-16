import React from 'react';
import { styled } from '../../../theme/stitches.config';
import { Form, Field, useFormikContext } from 'formik';
import Button from '../../../components/Button';
import IconButton from '../../../components/IconButton.jsx';
import InfoIcon from '../../../components/InfoIcon';
import { LockClosedIcon, SymbolIcon } from '@radix-ui/react-icons';
import { SwitchRoot, SwitchThumb } from '../../../components/Switch.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../../components/Tooltip.jsx';
import { FormWrapper, FormFieldWrapper, FormError } from '../../../components/Form';
import { FormRow, FormButtons, ColorPicker } from './components';
import { getRandomColor, getTextColor } from '../../../app/utils.js';
import { useSelector } from 'react-redux';
import { selectGlobalBreakpoint } from '../projectsSlice.js';
import { globalBreakpoints } from '../../../config.js';
import { Popover, PopoverArrow, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../../components/TooltipPopover.jsx';
import { Palette } from 'lucide-react';

const StyledSwitch = styled(SwitchRoot, {
  marginTop: 0,
  '@bp2': {
    marginTop: '13px',
  },
});

const StyledFormButtons = styled(FormButtons, {
  margin: '0',
  width: '100%',
  paddingTop: '0',
  gap: '$2',
  '@bp2': {
    gap: 'auto',
    width: 'auto',
    marginLeft: '$3',
    marginTop: '$4',
    paddingTop: '$3',
    paddingBottom: '$3',
  },
});

const StyledFormButton = styled(Button, {
  flex: '1',
  marginRight: '0 !important',
  '@bp2': {
    flex: 'unset',
    marginRight: '$3',
  },
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

const ColorPickerPopover = styled(PopoverContent, {
  borderRadius: '$2',
  padding: '$2',
  fontSize: '$3',
  lineHeight: 1,
  backgroundColor: '$hiContrast',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  color: '$textMedium',
});

const StyledFormRow = styled(FormRow, {
  display: 'flex',
  flexDirection: 'column',
  '@bp2': {
    flexDirection: 'row',
  },
});

const StyledField = styled(Field, {
  padding: '$2 !important',
  height: 'unset',
  width: '100%',
  variants: {
    focusDisabled: {
      true: {
        border: 'none !important',
        '&:focus': {
          outline: 'none !important',
          boxShadow: 'none !important',
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

const StyledFormFieldWrapper = styled(FormFieldWrapper, {
  marginLeft: 0,
  marginBottom: '$2',
  '@bp2': {
    marginBottom: '$3',
    marginLeft: '$3',
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

const StyledLabel = styled('label', {
  marginBottom: '$1 !important',
  '@bp2': {
    marginBottom: '$2',
  },
});

const LabelForm = ({ onCancel }) => {
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  return (
    <FormWrapper>
      <Form>
        <StyledFormRow>
          <StyledFormFieldWrapper css={{ position: 'relative' }}>
            <StyledLabel htmlFor="name">Name</StyledLabel>
            <StyledField name="name" id="name" disabled={values.ml} />
            {values.ml && <LabelLockOverlay shouldUsePopover={isSmallScreen} />}
            {!!errors.name && touched.name && <FormError>{errors.name}</FormError>}
          </StyledFormFieldWrapper>
          <StyledFormFieldWrapper>
            <StyledLabel htmlFor="color">Color</StyledLabel>
            <ColorPicker>
              {isSmallScreen ? (
                <>
                  <IconButton
                    type="button"
                    aria-label="Get a new color"
                    size="md"
                    onClick={() => setFieldValue('color', `#${getRandomColor()}`)}
                    css={{
                      backgroundColor: values.color,
                      borderColor: values.color,
                      color: getTextColor(values.color),
                      '&:hover': {
                        borderColor: values.color,
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
                      <StyledField name="color" id="color" focusDisabled={true} />
                      <PopoverTrigger asChild>
                        <ColorPickerButton variant="ghost">
                          <Palette />
                        </ColorPickerButton>
                      </PopoverTrigger>
                      <ColorPickerPopover
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
                            onClick={() => setFieldValue('color', `${color}`)}
                          />
                        ))}
                        <PopoverArrow style={{ fill: 'white' }} />
                      </ColorPickerPopover>
                    </SmallScreenColorPicker>
                  </Popover>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        type="button"
                        aria-label="Get a new color"
                        size="md"
                        onClick={() => setFieldValue('color', `#${getRandomColor()}`)}
                        css={{
                          backgroundColor: values.color,
                          borderColor: values.color,
                          color: getTextColor(values.color),
                          '&:hover': {
                            borderColor: values.color,
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

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Field name="color" id="color" />
                      </div>
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
                          onClick={() => setFieldValue('color', `${color}`)}
                        />
                      ))}
                      <TooltipArrow css={{ fill: 'white' }} />
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </ColorPicker>
            {!!errors.color && touched.color && <FormError>{errors.color}</FormError>}
          </StyledFormFieldWrapper>
          <StyledFormFieldWrapper>
            <StyledLabel htmlFor="label-enabled">
              Enabled
              <InfoIcon tooltipContent={<ReviewerEnabledHelp />} side="top" />
            </StyledLabel>
            <StyledSwitch
              id="enabled"
              checked={values.reviewerEnabled}
              onCheckedChange={(enabled) => setFieldValue('reviewerEnabled', enabled)}
            >
              <SwitchThumb />
            </StyledSwitch>
          </StyledFormFieldWrapper>
          <StyledFormButtons>
            <StyledFormButton size="small" type="submit" disabled={!values.name}>
              Save
            </StyledFormButton>
            <StyledFormButton size="small" type="button" onClick={onCancel}>
              Cancel
            </StyledFormButton>
          </StyledFormButtons>
        </StyledFormRow>
      </Form>
    </FormWrapper>
  );
};

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

const ReviewerEnabledHelp = () => (
  <div style={{ maxWidth: '200px' }}>
    Disabling a label will prevent users from applying it to images going forward, but it will not
    remove existing instances of the label on your images.
  </div>
);

const LockIcon = styled(LockClosedIcon, {
  marginLeft: '$2',
  marginRight: '$2',
});

const Overlay = styled('div', {
  position: 'absolute',
  color: '$textMedium',
  height: '53px',
  width: '100%',
  top: '30px',
  left: '1px',
  padding: '$1',
  borderRadius: '$1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const LabelLockOverlay = ({ shouldUsePopover = false }) => {
  return (
    <>
      {shouldUsePopover ? (
        <Popover>
          <PopoverTrigger asChild>
            <Overlay css={{ top: '35px', height: 'auto' }}>
              <LockIcon />
            </Overlay>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            sideOffset={5}
            style={{
              maxWidth: 324,
            }}
          >
            You can&apos;t edit this label&apos;s name because it is managed by a machine learning
            model, but you can change it&apos;s color and enable/disable it.
            <PopoverArrow />
          </PopoverContent>
        </Popover>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Overlay>
              <LockIcon />
            </Overlay>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={5}
            css={{
              maxWidth: 324,
            }}
          >
            You can&apos;t edit this label&apos;s name because it is managed by a machine learning
            model, but you can change it&apos;s color and enable/disable it.
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};

export default LabelForm;
