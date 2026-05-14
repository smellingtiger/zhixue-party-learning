'use client';

import { usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  whitelist?: string[];
}

export const ProtectedRoute = ({ children, whitelist = ['/login', '/reset'] }: ProtectedRouteProps) => {
  const pathname = usePathname();

  const isWhitelisted = () => {
    if (!pathname) return false;
    
    return whitelist.some((path) => {
      if (path.endsWith('*')) {
        const basePath = path.slice(0, -1);
        return pathname.startsWith(basePath);
      }
      return pathname === path;
    });
  };

  if (!pathname || isWhitelisted()) {
    return <>{children}</>;
  }

  return <>{children}</>;
};