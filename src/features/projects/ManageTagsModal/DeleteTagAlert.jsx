import React from 'react';
import { Alert, AlertPortal, AlertOverlay, AlertContent, AlertTitle } from '../../../components/AlertDialog.jsx';
import Button from '../../../components/Button.jsx';
import { red } from '@radix-ui/colors';
import { styled } from '../../../theme/stitches.config.js';

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
  margin: 'auto $1',
  height: '$5'
});

export const DeleteTagAlert = ({ 
  open, 
  tag,
  onConfirm,
  onCancel
}) => {
  return (
    <Alert open={open}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          <AlertTitle>
            Are you sure you&apos;d like to delete the{' '}
            {tag && 
              <PreviewTag 
                css={{ 
                  display: 'inline', 
                  borderColor: tag.color,
                  backgroundColor: `${tag.color}1A`,
                }} 
                color={tag.color} 
              >
                { tag.name }
              </PreviewTag>
            } tag?
          </AlertTitle>
          <div>
            Deleting this tag will:
            <ul>
              <li>
                remove it as an option to apply to your images
              </li>
              <li>remove all instances of it from your existing images</li>
            </ul>
            This action can not be undone.
          </div>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              css={{ 
                border: 'none' 
              }} 
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
            <Button
              size="small"
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 },
              }}
              onClick={() => onConfirm(tag._id)}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};
