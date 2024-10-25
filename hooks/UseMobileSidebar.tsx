import { useState } from 'react';

export const useMobileSidebar = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggle = () => {
    setIsMinimized((prev) => !prev);
  };

  return { isMinimized, toggle };
};
