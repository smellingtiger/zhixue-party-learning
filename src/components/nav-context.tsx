'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavContextType {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const NavContext = createContext<NavContextType>({
  isExpanded: false,
  setIsExpanded: () => {},
});

export function useNavContext() {
  return useContext(NavContext);
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <NavContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </NavContext.Provider>
  );
}
