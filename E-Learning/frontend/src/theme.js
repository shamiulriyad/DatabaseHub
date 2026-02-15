import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#F7F5FF',
    100: '#EDE5FF',
    200: '#D5C6FF',
    300: '#B99BFF',
    400: '#8F68FF',
    500: '#6F3BFF',   // Rich violet — primary
    600: '#5B30E6',
    700: '#4426B3',
    800: '#311A80',
    900: '#20124D',
  },

  navy: {
    50: '#F2F5F8',
    100: '#E6EEF6',
    500: '#071028',   // Deep premium navy
  },

  background: '#0B0E14', // Dark canvas for premium feel
  card: '#0F1724',       // Slightly lighter than background
  text: '#EAF0FF',       // Pale text for contrast
  textSecondary: '#9AA4B2',
  accent: '#D4AF37',     // Premium gold
  border: '#1B2633',
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
    baseStyle: (props) => ({
      bg: props.colorMode === 'dark' ? 'card' : '#FFFFFF',
      borderRadius: 'lg',
      boxShadow: props.colorMode === 'dark' ? '0 8px 30px rgba(2,6,23,0.6)' : '0 6px 18px rgba(2,6,23,0.06)',
    }),
  },
};

const styles = {
  global: props => ({
    'html, body': {
      bg: props.colorMode === 'dark' ? colors.background : '#FFFFFF',
      color: props.colorMode === 'dark' ? colors.text : '#0F1724',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },

    a: {
      color: 'brand.300',
      fontWeight: 600,
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
