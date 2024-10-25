import { useState } from 'react';

export const useNormalSidebar = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggle = () => {
    setIsMinimized((prev) => !prev);
  };

  return { isMinimized, toggle };
};
