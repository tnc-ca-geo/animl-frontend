import React, { useState } from 'react';
import styled from 'styled-components';
// import { ChevronUpIcon, ChevronDownIcon } from '../assets/Icons'

const StyledSelect = styled.div`
  select {
    color: #000000;
    /* font-weight: 700;
    margin-left: 10px;
    padding: 5px 8px; */
    font-size: 14px;
    width: 60px;
    border: none;
    box-shadow: none;
    background: transparent;
    background-image: none;
    -webkit-appearance: none;
    cursor: pointer;
    :focus {
      outline: none;
    }
  }
  :hover {
    span:before {
      border-top-color: #222;
    }
  }
`;


const Caret = styled.span`
  position: relative;
  /* cursor: pointer; */
  pointer-events: none;
  :before {
    content: '';
    position: absolute;
    top: 8px;
    left: -30px;
    border-top: 6px solid #999;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
  }
  :after {
    content: '';
    position: absolute;
    top: 8px;
    left: -29px;
    border-top: 5px solid #fff;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
  }
`

const Select = (props) => (
  <StyledSelect>
    <select
      onChange={props.handleChange}
      value={props.defaultValue}>
      {props.options.map((option, i) => (
        <option
          key={i}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
    <Caret/>
  </StyledSelect>
);

export default Select;
