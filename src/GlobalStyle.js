import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root { min-height: 100%; }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.font};
    background: ${({ theme }) => theme.color.paper};
    color: ${({ theme }) => theme.color.ink};
    font-variant-numeric: tabular-nums;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button, input, select, textarea { font: inherit; color: inherit; }

  img { max-width: 100%; display: block; }

  p { overflow-wrap: anywhere; }

  a:focus-visible, button:focus-visible, summary:focus-visible {
    outline: 3px solid ${({ theme }) => theme.color.green};
    outline-offset: 2px;
  }

  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: 0 0; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
