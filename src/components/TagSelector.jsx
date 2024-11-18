import React, { useEffect, useState } from 'react';
import { styled } from '../theme/stitches.config.js';
import { Cross2Icon, MagnifyingGlassIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { Root as PopoverRoot, PopoverTrigger, PopoverContent, PopoverPortal } from '@radix-ui/react-popover';
import { mauve, slate, violet } from '@radix-ui/colors';

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
    background: violet.violet3
  }
});

const SelectorTitle = styled('div', {
  display: 'flex',
  gap: '$2'
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

const TagSearchContainer = styled('div', {
  display: 'flex',
  borderTop: '1px solid $border',
  paddingBottom: '$1',
  paddingTop: '$1',
});

const TagSearchIcon = styled('div', {
  width: 32,
  display: 'grid',
  placeItems: 'center'
});

const TagSearch = styled('input', {
  all: 'unset',
  padding: '$1 $3',
  paddingLeft: 'unset'
});

const TagOptionsContainer = styled('div', {
  maxHeight: '50vh',
  overflowY: 'scroll',
  maxWidth: 450
});

const TagOption = styled('div', {
  padding: '$1 $3',
  '&:hover': {
    background: '$gray3',
    cursor: 'pointer',
  }
});

const AllTagsAdded = styled('div', {
  padding: '$2 $3',
  color: '$gray10'
});

const filterList = (tags, searchTerm) => {
  return tags.filter(({ name }) => {
    const lower = name.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return lower.startsWith(searchLower)
  });
}

export const TagSelector = ({
  tagList,
  onAddTag,
}) => {
  const [tagOptions, setTagOptions] = useState(tagList);
  const [searchValue, setSearchValue] = useState("");

  const onInput = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.value !== undefined) {
      setSearchValue(e.target.value);
    }
  }

  useEffect(() => {
    const options = filterList(tagList, searchValue);
    setTagOptions(options);
  }, [searchValue]);

  const onClickTag = (tagId) => {
    const options = tagOptions.filter(({ _id }) => _id !== tagId );
    setTagOptions(options);
    onAddTag(tagId);
  }

  return (
    <PopoverRoot>
      <PopoverTrigger asChild onClick={() => setTagOptions(tagList)}>
        <Selector>
          <SelectorTitle>
            <PlusCircledIcon style={{ margin: "auto 0" }} />
            Tag
          </SelectorTitle>
        </Selector>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent side='top' sideOffset={5} align='start'>
          <TagSelectorContent>
            <TagOptionsContainer>
              { tagOptions.length === 0 &&
                <AllTagsAdded>
                  All tags added
                </AllTagsAdded>
              }
              { tagOptions.map(({ _id, name }) => (
                <TagOption 
                  key={_id}
                  onClick={() => onClickTag(_id)}
                >
                  { name }
                </TagOption>
              ))}
            </TagOptionsContainer>
            <TagSearchContainer>
              <TagSearchIcon>
                { searchValue !== "" &&
                  <Cross2Icon 
                    onClick={() => setSearchValue("")}
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
                onChange={(e) => onInput(e)}
              />
            </TagSearchContainer>
          </TagSelectorContent>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  );
}
