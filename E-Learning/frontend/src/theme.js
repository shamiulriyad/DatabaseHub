import { extendTheme } from '@chakra-ui/react';

const colors = {
  // Accent / Brand
  brand: {
    400: '#7055ff', // primary purple (brand.400)
    500: '#5533ee', // button bg (brand.500)
  },

  // Gold accents
  gold: {
    300: '#fcd34d',
    400: '#fbbf24',
  },

  // Cosmic palette (dark-only)
  cosmos: {
    bg: '#070B1A',
    surface: '#0D1428',
    card: '#111A35',
    border: '#1E2D55',
    muted: '#8896BB',
  },

  // Text tokens
  text: {
    primary: 'whiteAlpha.900',
    muted: '#8896BB',
  },
};

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight: 600,
      px: 6,
      py: 3,
    },
    variants: {
      solid: (props) => ({
        bg: 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.400' },
      }),
      primary: {
        bg: 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.400' },
      },
      outline_gold: {
        bg: 'transparent',
        color: 'gold.400',
        border: '1px solid',
        borderColor: 'gold.400',
        _hover: { bg: 'gold.300', color: 'gray.900' },
      },
    },
    defaultProps: {
      variant: 'solid',
    },
  },

  Badge: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight: 600,
    },
  },

  Card: {
    baseStyle: {
      borderRadius: '2xl',
      bg: 'cosmos.card',
      borderColor: 'cosmos.border',
      boxShadow: 'sm',
    },
  },
};

const styles = {
  global: {
    'html, body': {
      bg: 'cosmos.bg',
      color: 'text.primary',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    a: {
      color: 'brand.400',
      fontWeight: 600,
      _hover: { textDecoration: 'underline' },
    },
    '::placeholder': {
      color: 'cosmos.muted',
    },
  },
};

const fonts = {
  heading: `"Playfair Display", serif`,
  body: `"DM Sans", "Segoe UI", system-ui, sans-serif`,
};

// spacing scale (8px base)
const space = {
  px: '1px',
  0: '0',
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  5: '48px',
  6: '64px',
  7: '80px',
};

const theme = extendTheme({
  config,
  colors,
  components,
  styles,
  fonts,
  space,
  radii: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  semanticTokens: {
    colors: {
      'page.bg': { default: 'cosmos.bg' },
      'surface.bg': { default: 'cosmos.surface' },
      'card.bg': { default: 'cosmos.card' },
      'card.border': { default: 'cosmos.border' },
      'text.primary': { default: 'text.primary' },
      'text.muted': { default: 'text.muted' },
      'brand.400': { default: 'brand.400' },
      'brand.500': { default: 'brand.500' },
      'gold.400': { default: 'gold.400' },
      'gold.300': { default: 'gold.300' },
    },
  },
});

export default theme;
