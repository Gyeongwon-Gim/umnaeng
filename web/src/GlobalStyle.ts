import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  body {
    margin: 0;
    background: #fafafa;
    color: #212121;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic",
      Roboto, sans-serif;
    -webkit-tap-highlight-color: transparent;
  }

  button {
    font: inherit;
    color: inherit;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  input {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
