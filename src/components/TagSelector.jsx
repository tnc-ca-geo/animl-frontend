import React, { useEffect, useState } from 'react';
import { styled } from '../theme/stitches.config.js';
// [FUTURE FEATURE]
// import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import {
  Root as PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from '@radix-ui/react-popover';
import { mauve, violet } from '@radix-ui/colors';

const Selector = styled('div', {
  padding: '$1 $3',
  fontSize: '$2',
  color: mauve.mauve11,
  fontWeight: 'bold',
  display: 'grid',
  placeItems: 'center',
  height: 32,
  borderRadius: '$2',
  borderColor: '$gray10',
  borderStyle: 'dashed',
  borderWidth: '1px',
  '&:hover': {
    cursor: 'pointer',
    background: violet.violet3,
  },
});

const SelectorTitle = styled('div', {
  display: 'flex',
  gap: '$2',
});

const TagSelectorContent = styled('div', {
  background: 'White',
  border: '1px solid $border',
  borderRadius: '$2',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  overflow: 'hidden',
  fontFamily: '$mono',
  fontSize: '$3',
  fontWeight: '$1',
});

// [FUTURE FEATURE]
// const TagSearchContainer = styled('div', {
//   display: 'flex',
//   borderTop: '1px solid $border',
//   paddingBottom: '$1',
//   paddingTop: '$1',
// });
//
// const TagSearchIcon = styled('div', {
//   width: 32,
//   display: 'grid',
//   placeItems: 'center',
// });
//
// const CrossIcon = styled(Cross2Icon, {
//   '&:hover': {
//     cursor: 'pointer'
//   }
// });
//
// const TagSearch = styled('input', {
//   all: 'unset',
//   padding: '$1 $3',
//   paddingLeft: 'unset'
// });

const TagOptionsContainer = styled('div', {
  maxHeight: '50vh',
  overflowY: 'auto',
  maxWidth: 450,
});

const TagOption = styled('div', {
  padding: '$1 $3',
  '&:hover': {
    background: '$gray3',
    cursor: 'pointer',
  },
});

const DefaultTagMessage = styled('div', {
  padding: '$2 $3',
  color: '$gray10',
});

// [FUTURE FEATURE]
// const filterList = (tags, searchTerm) => {
//   return tags.filter(({ name }) => {
//     const lower = name.toLowerCase();
//     const searchLower = searchTerm.toLowerCase();
//     return lower.startsWith(searchLower)
//   });
// }
//
// const allTagsAdded = "All tags added"
// const noMatches = "No matches"

export const TagSelector = ({ projectTags, unaddedTags, onAddTag, imageId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagOptions, setTagOptions] = useState(unaddedTags);

  // [FUTURE FEATURE]
  // const errMessage = 'All tags added';
  // const [searchValue, setSearchValue] = useState("");
  // const [errMessage, setErrMessage] = useState(allTagsAdded);

  // [FUTURE FEATURE]
  // const onInput = (e) => {
  //   if (e.target.value !== undefined) {
  //     setSearchValue(e.target.value);
  //   }
  // }
  //
  // useEffect(() => {
  //   const options = filterList(tagList, searchValue);
  //   if (searchValue === "") {
  //     setErrMessage(allTagsAdded)
  //   } else if (options.length === 0) {
  //     setErrMessage(noMatches);
  //   }
  //   setTagOptions(options);
  // }, [searchValue]);
  //
  // [FUTURE FEATURE] Leave search commented for now
  // const onClearSearch = () => {
  //   setSearchValue("");
  //   setErrMessage(allTagsAdded)
  // }

  const onClickTag = (tag) => {
    const options = tagOptions.filter(({ _id }) => _id !== tag._id);
    setTagOptions(options);
    onAddTag(tag);
  };

  // Close when changing image using keyboard nav
  useEffect(() => {
    setIsOpen(false);
  }, [imageId]);

  return (
    <PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onClick={() => setTagOptions(unaddedTags)}>
        <Selector>
          <SelectorTitle>
            <PlusCircledIcon style={{ margin: 'auto 0' }} />
            Tag
          </SelectorTitle>
        </Selector>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent side="top" sideOffset={5} align="start">
          <TagSelectorContent>
            <TagOptionsContainer>
              {projectTags.length === 0 && <DefaultTagMessage>No tags available</DefaultTagMessage>}
              {projectTags.length > 0 && tagOptions.length === 0 && (
                <DefaultTagMessage>All tags added</DefaultTagMessage>
              )}
              {tagOptions.map((tag) => (
                <TagOption key={tag._id} onClick={() => onClickTag(tag)}>
                  {tag.name}
                </TagOption>
              ))}
            </TagOptionsContainer>
            {/* [FUTURE FEATURE]
            <TagSearchContainer>
              <TagSearchIcon>
                { searchValue !== "" &&
                  <CrossIcon 
                    onClick={() => onClearSearch()}
                    height={18}
                    width={18}
                    color={slate.slate9}
                  />
                }
                { searchValue === "" &&
                  <MagnifyingGlassIcon 
                    height={18} 
                    width={18} 
                    color={slate.slate9} 
                  />
                }
              </TagSearchIcon>
              <TagSearch 
                placeholder='Tag...' 
                value={searchValue}
                onKeyDown={(e) => { e.stopPropagation(); }}
                onChange={(e) => onInput(e)}
              />
            </TagSearchContainer>
          */}
          </TagSelectorContent>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  );
};
