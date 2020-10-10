import styled from 'styled-components';

export const Grid = styled.div`

`;

export const Row = styled.div`
  display: flex;
`;

const media = {
  xs: (styles) => `
    @media only screen and (max-width: 576px) {
      ${styles}
    }
  `,
  sm: (styles) => `
    @media only screen and (max-width: 768pxpx) {
      ${styles}
    }
  `,
  md: (styles) => `
    @media only screen and (max-width: 992px) {
      ${styles}
    }
  `,
  lg: (styles) => `
    @media only screen and (max-width: 1200px) {
      ${styles}
    }
  `,
};

export const Col = styled.div`
  flex: ${(props => props.size)};
  ${(props) => props.collapse && media[props.collapse](`
    display: none;
  `)};
`;