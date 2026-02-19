import { extendTheme } from '@chakra-ui/react';
import { keyframes as ckKeyframes } from '@emotion/react';

// ---------------------------------------------------------------------------
// 1. COLOR PALETTE – professional, accessible, academic
// ---------------------------------------------------------------------------
const colors = {
  // Primary: deep indigo-blue (trust, knowledge)
  brand: {
    50:  '#EEF2FF',
    100: '#D9E2FE',
    200: '#B9C6FE',
    300: '#93A4FC',
    400: '#6F7FF9',
    500: '#4F46E5',  // ← primary action colour (AA-pass on white)
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#23215B',
  },

  // Secondary: teal (growth, learning)
  secondary: {
    50:  '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',  // ← secondary action colour
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Accent: warm amber (highlights, badges)
  accent: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Semantic surface tokens (consumed via useColorModeValue in components)
  surface: {
    50:  '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
  },
};

// ---------------------------------------------------------------------------
// 2. CONFIG
// ---------------------------------------------------------------------------
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// ---------------------------------------------------------------------------
// 3. KEYFRAME ANIMATIONS (Chakra-native)
// ---------------------------------------------------------------------------
const fadeIn = ckKeyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = ckKeyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

const slideInRight = ckKeyframes`
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const shimmer = ckKeyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ---------------------------------------------------------------------------
// 4. TYPOGRAPHY
// ---------------------------------------------------------------------------
const fonts = {
  heading: `'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`,
  body:    `'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`,
  mono:    `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
};

const fontSizes = {
  xs:   '0.75rem',   // 12px
  sm:   '0.875rem',  // 14px
  md:   '1rem',      // 16px
  lg:   '1.125rem',  // 18px
  xl:   '1.25rem',   // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
};

// ---------------------------------------------------------------------------
// 5. COMPONENT OVERRIDES
// ---------------------------------------------------------------------------
const components = {
  // -- Button ---------------------------------------------------------------
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'lg',
      transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      },
      _active: {
        transform: 'translateY(0)',
        boxShadow: 'sm',
      },
      _focusVisible: {
        boxShadow: '0 0 0 3px rgba(79,70,229,0.45)',
      },
    },
    variants: {
      primary: {
        bg: 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.600' },
        _active: { bg: 'brand.700' },
      },
      secondary: {
        bg: 'secondary.500',
        color: 'white',
        _hover: { bg: 'secondary.600' },
        _active: { bg: 'secondary.700' },
      },
      accent: {
        bg: 'accent.500',
        color: 'white',
        _hover: { bg: 'accent.600' },
        _active: { bg: 'accent.700' },
      },
      ghost: (props) => ({
        color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100',
        },
      }),
      outline: {
        borderWidth: '2px',
        _hover: {
          bg: 'brand.50',
        },
      },
    },
  },

  // -- Badge ----------------------------------------------------------------
  Badge: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'full',
      px: 3,
      py: 0.5,
      fontSize: 'xs',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  },

  // -- Card -----------------------------------------------------------------
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'xl',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        _hover: {
          boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
          transform: 'translateY(-2px)',
        },
      },
    }),
  },

  // -- Heading --------------------------------------------------------------
  Heading: {
    baseStyle: {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.2',
    },
    sizes: {
      '2xl': { fontSize: ['3xl', '4xl', '5xl'] },  // responsive
      xl:    { fontSize: ['2xl', '3xl'] },
      lg:    { fontSize: ['xl', '2xl'] },
      md:    { fontSize: ['lg', 'xl'] },
      sm:    { fontSize: 'md' },
    },
  },

  // -- Text -----------------------------------------------------------------
  Text: {
    baseStyle: (props) => ({
      lineHeight: '1.7',
      color: props.colorMode === 'dark' ? 'gray.300' : 'gray.700',
    }),
  },

  // -- Input ----------------------------------------------------------------
  Input: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
    variants: {
      outline: (props) => ({
        field: {
          borderRadius: 'lg',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          transition: 'all 0.2s',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      }),
    },
  },

  // -- Textarea -------------------------------------------------------------
  Textarea: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
    variants: {
      outline: (props) => ({
        borderRadius: 'lg',
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
        },
      }),
    },
  },

  // -- Modal ----------------------------------------------------------------
  Modal: {
    baseStyle: (props) => ({
      dialog: {
        borderRadius: 'xl',
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        animation: `${fadeInScale} 0.25s cubic-bezier(.4,0,.2,1)`,
      },
      overlay: {
        bg: 'blackAlpha.600',
        backdropFilter: 'blur(4px)',
      },
    }),
  },

  // -- Menu -----------------------------------------------------------------
  Menu: {
    baseStyle: (props) => ({
      list: {
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        py: 2,
        animation: `${fadeIn} 0.15s ease-out`,
      },
      item: {
        borderRadius: 'md',
        mx: 2,
        px: 3,
        transition: 'all 0.15s',
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'brand.50',
        },
        _focus: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'brand.50',
        },
      },
    }),
  },

  // -- Tooltip --------------------------------------------------------------
  Tooltip: {
    baseStyle: {
      borderRadius: 'lg',
      px: 3,
      py: 1.5,
      fontSize: 'sm',
      fontWeight: '500',
      boxShadow: 'lg',
    },
  },

  // -- Drawer ---------------------------------------------------------------
  Drawer: {
    baseStyle: (props) => ({
      dialog: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      },
      overlay: {
        bg: 'blackAlpha.600',
        backdropFilter: 'blur(4px)',
      },
    }),
  },

  // -- Tabs -----------------------------------------------------------------
  Tabs: {
    variants: {
      line: {
        tab: {
          fontWeight: '600',
          transition: 'all 0.2s',
          _selected: {
            color: 'brand.500',
            borderColor: 'brand.500',
          },
        },
      },
      'soft-rounded': {
        tab: {
          fontWeight: '600',
          _selected: {
            bg: 'brand.500',
            color: 'white',
          },
        },
      },
    },
  },

  // -- Tag ------------------------------------------------------------------
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'full',
        fontWeight: '500',
      },
    },
  },

  // -- Skeleton -------------------------------------------------------------
  Skeleton: {
    baseStyle: {
      borderRadius: 'lg',
    },
  },
};

// ---------------------------------------------------------------------------
// 6. GLOBAL STYLES
// ---------------------------------------------------------------------------
const styles = {
  global: (props) => ({
    'html, body': {
      bg: props.colorMode === 'dark' ? 'gray.900' : '#FAFBFC',
      color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
      fontFamily: `'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`,
      fontSize: '16px',
      lineHeight: '1.7',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      scrollBehavior: 'smooth',
    },

    '*::selection': {
      bg: 'brand.100',
      color: 'brand.900',
    },

    a: {
      color: 'brand.500',
      fontWeight: 500,
      transition: 'color 0.2s',
      _hover: {
        color: 'brand.600',
        textDecoration: 'none',
      },
    },

    '::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
    },

    /* Subtle scrollbar */
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
    },
    '::-webkit-scrollbar-thumb': {
      bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
    },
  }),
};

// ---------------------------------------------------------------------------
// 7. SHADOWS & RADII
// ---------------------------------------------------------------------------
const shadows = {
  xs:  '0 1px 2px rgba(0,0,0,0.04)',
  sm:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md:  '0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
  lg:  '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
  xl:  '0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)',
  '2xl': '0 25px 50px rgba(0,0,0,0.15)',
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
  brand: '0 4px 14px rgba(79,70,229,0.25)',
};

const radii = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl': '24px',
  full: '9999px',
};

// ---------------------------------------------------------------------------
// EXPORT THEME
// ---------------------------------------------------------------------------
const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  shadows,
  radii,
  components,
  styles,
});

// Export keyframes so components can use them
export { fadeIn, fadeInScale, slideInRight, shimmer };
export default theme;
