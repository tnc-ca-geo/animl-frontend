import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconLeft,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import IconButton from '../../components/IconButton.jsx';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import DeleteImagesAlert from '../images/DeleteImagesAlert.jsx';
import { setDeleteImagesAlertStatus } from '../images/imagesSlice';
import { selectFocusIndex, setSelectedImageIndices } from '../review/reviewSlice.js';
import { setModalOpen, setModalContent, selectLabels } from '../projects/projectsSlice.js';
import { Trash2, Clock, Download } from 'lucide-react';
import { relToAbs } from '../../app/utils';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  position: 'absolute',
  right: 0,
  margin: '0 $2',
});

const LoupeDropdown = ({ image }) => {
  const dispatch = useDispatch();
  const focusIndex = useSelector(selectFocusIndex);

  const handleDeleteImageItemClick = () => {
    dispatch(setSelectedImageIndices([focusIndex.image]));
    dispatch(setDeleteImagesAlertStatus({ openStatus: true, deleteImagesByFilter: false }));
  };

  const handleEditTimestampClick = () => {
    dispatch(setModalOpen(true));
    dispatch(setModalContent('edit-image-timestamp-form'));
  };

  const handleDownloadOriginalImageClick = () => {
    const link = document.createElement('a');
    link.href = image.url.original;
    link.download = `image_${image._id}.${image.fileTypeExtension || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canvasRef = useRef(null);
  const projectLabels = useSelector(selectLabels);

  const handleDownloadBBoxImageClick = () => {
    console.log('image: ', image);
    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // if needed for CORS
    img.src = image.url.original;
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // build array of objects to render
      const currImgObjects = image.objects;
      let objectsToRender = currImgObjects.filter((obj) =>
        obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
      );

      objectsToRender.forEach((obj, i) => {
        console.log('object: ', i, obj);

        // show first non-invalidated label in array
        let label = obj.labels.find((lbl) => lbl.validation === null || lbl.validation.validated);
        if (obj.locked) {
          // unless object is locked, in which case show first validated label
          label = obj.labels.find((lbl) => lbl.validation && lbl.validation.validated);
        } else if (obj.isTemp) {
          // or object is being added
          label = { category: '', conf: 0, index: 0 };
        }

        const fallbackLabel = {
          _id: 'fallback_label',
          name: 'ERROR FINDING LABEL',
          color: '#E54D2E',
        };
        const displayLabel =
          projectLabels?.find(({ _id }) => _id === label.labelId) || fallbackLabel;
        const conf = Number.parseFloat(label.conf * 100).toFixed(1);

        // bounding box in absolute coords
        let { left, top, width, height } = relToAbs(obj.bbox, image.imageWidth, image.imageHeight);

        // Draw rectangle
        ctx.strokeStyle = displayLabel.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(left, top, width, height);

        // Draw label
        // TODO: use label positioning logic from BoundingBoxLabel.jsx
        ctx.fillStyle = displayLabel.color;
        const labelText = `${displayLabel.name} ${conf}%`;
        const textWidth = ctx.measureText(labelText).width; // NOTE: This doesn't seem accurate
        const textHeight = 18; // approximate height
        ctx.fillRect(left, top - textHeight, textWidth + 8, textHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px sans-serif';
        ctx.fillText(labelText, left + 4, top - 4);
      });

      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'image_with_boxes.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
  };

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger asChild>
        <IconButton variant="ghost">
          <DotsHorizontalIcon />
        </IconButton>
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent sideOffset={5}>
        <DropdownMenuItem onSelect={handleEditTimestampClick}>
          <DropdownMenuItemIconLeft>
            <Clock size={15} />
          </DropdownMenuItemIconLeft>
          Edit Image Timestamp
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDownloadOriginalImageClick}>
          <DropdownMenuItemIconLeft>
            <Download size={15} />
          </DropdownMenuItemIconLeft>
          Download image (original)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDownloadBBoxImageClick}>
          <DropdownMenuItemIconLeft>
            <Download size={15} />
          </DropdownMenuItemIconLeft>
          Download image (with bounding boxes)
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleDeleteImageItemClick}
          css={{
            color: '$errorText',
            '&[data-highlighted]': {
              backgroundColor: '$errorBase',
              color: '$errorBg',
            },
          }}
        >
          <DropdownMenuItemIconLeft>
            <Trash2 size={15} />
          </DropdownMenuItemIconLeft>
          Delete Image
        </DropdownMenuItem>
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>

      {/* Alerts */}
      <DeleteImagesAlert imgIds={[image._id]} />

      {/* Hidden canvas for image download w/ bounding boxes */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </DropdownMenu>
  );
};

export default LoupeDropdown;
