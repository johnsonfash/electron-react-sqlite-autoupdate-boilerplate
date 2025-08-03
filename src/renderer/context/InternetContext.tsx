import React, { createContext, useContext } from 'react';
import useCheckInternet from '../hooks/useCheckInternet';

type InternetContextType = {
  online: boolean;
};

const InternetContext = createContext<InternetContextType>({ online: true });

export const InternetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const online = useCheckInternet(10000); // Check every 10s
  return (
    <InternetContext.Provider value={{ online }}>
      {children}
    </InternetContext.Provider>
  );
};

export const useInternet = () => useContext(InternetContext).online;
