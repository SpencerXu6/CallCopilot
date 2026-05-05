import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'sm' | 'md' | 'lg';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const bp: Breakpoint = width >= 1024 ? 'lg' : width >= 768 ? 'md' : 'sm';
  return {
    bp,
    width,
    isMobile: bp === 'sm',
    isTablet: bp === 'md',
    isDesktop: bp === 'lg',
    isWide: bp !== 'sm',
  };
}
