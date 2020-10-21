import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

  * {
    margin: 0;
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:wght@300;400;500;600;700&display=swap');
    font-family: 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
      'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
  }

  h1 {
    font-weight: 500;
  }

  p {
    font-weight: 400;
  }

  code {
    font-family: 'Roboto Mono', 'Courier New', monospace;
  }

`

export default GlobalStyle;
