import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Updated breakpoints - Mobile: até 480px, Tablet: 481px a 1024px, Desktop: 1025px em diante
export const useIsMobile = () => useMediaQuery('(max-width: 480px)');
export const useIsTablet = () => useMediaQuery('(min-width: 481px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

// Legacy for compatibility
export const useIsDesktopLegacy = () => useMediaQuery('(min-width: 768px)');