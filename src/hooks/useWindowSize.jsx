import React, { createContext, useContext, useEffect, useState } from 'react';

const WindowSizeContext = createContext(0);
export const useWindowSize = () => {
  return useContext(WindowSizeContext);
};
export const WindowSize = ({ children }) => {
  const [height, setHeight] = useState(() => window?.innerHeight ?? 0);
  const [width, setWidth] = useState(() => window?.innerWidth ?? 0);

  const updateSize = () => {
    if (typeof window !== 'undefined') {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    }
  };

  useEffect(() => {
    window?.addEventListener('resize', updateSize);
    return () => {
      window?.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <WindowSizeContext.Provider value={{ height: height, width: width }}>
      {children}
    </WindowSizeContext.Provider>
  );
};
