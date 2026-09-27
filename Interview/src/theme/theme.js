import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6d35ff', light: '#8b62ff', dark: '#4e20c8' },
    secondary: { main: '#147dff', light: '#52a0ff', dark: '#0759bf' },
    success: { main: '#16a879' },
    warning: { main: '#f6a127' },
    error: { main: '#ef476f' },
    background: { default: '#01040b', paper: 'transparent' },
    text: { primary: '#f4f8ff', secondary: '#9aacc4' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  breakpoints: {
    values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiIconButton: {
      defaultProps: { size: 'medium' },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        body: { backgroundColor: '#01040b', color: '#f4f8ff' },
      },
    },
  },
})

export default theme
