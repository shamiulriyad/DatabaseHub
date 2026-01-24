import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#EEF4EF',
    100: '#D7E6D8',
    200: '#BFD8C1',
    300: '#A7C9AA',
    400: '#6F9F73',
    500: '#2C5F2D',   // Primary Brand Green
    600: '#254F26',
    700: '#1E3F1F',
    800: '#162E17',
    900: '#0F1E10',
  },

  navy: {
    500: '#1B3B6F',   // Academic navy
  },

  background: '#F4F1EC', // Ivory parchment
  card: '#E7E2D9',       // Paper-like card background
  text: '#1F1F1F',       // Deep charcoal
  textSecondary: '#6B6B6B',
  accent: '#C9A66B',     // Antique gold
  border: '#CFC6B8',
};

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
    baseStyle: {
      borderRadius: 'md',
      fontWeight: '600',
      _hover: {
        transform: 'translateY(-1px)',
      },
    },
  },

  Badge: {
    baseStyle: {
      bg: 'accent',
      color: 'gray.900',
      fontWeight: '600',
      borderRadius: 'sm',
      px: 2,
    },
  },

  Card: {
    baseStyle: {
      bg: 'card',
      borderRadius: 'lg',
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    },
  },
};

const styles = {
  global: props => ({
    'html, body': {
      bg: props.colorMode === 'dark' ? 'gray.900' : colors.background,
      color: props.colorMode === 'dark' ? 'gray.100' : colors.text,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },

    a: {
      color: 'brand.500',
      fontWeight: 500,
      _hover: {
        textDecoration: 'underline',
      },
    },

    '::placeholder': {
      color: colors.textSecondary,
    },
  }),
};

const fonts = {
  heading: `'Playfair Display', serif`,
  body: `'Inter', 'Segoe UI', system-ui, sans-serif`,
};

const theme = extendTheme({
  config,
  colors,
  components,
  styles,
  fonts,
});

export default theme;
