import React, { useEffect } from 'react';
import { IconButton, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const ThemeToggle = (props) => {
  const { colorMode, toggleColorMode } = useColorMode();

  // keep a synchronized `data-theme` attribute on <html> so global CSS variables react
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', colorMode);
    } catch (e) {
      // noop in non-browser environments
    }
  }, [colorMode]);

  return (
    <IconButton
      aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      {...props}
    />
  );
};

export default ThemeToggle;
