import React, { createContext, ReactNode } from "react";
import { doctors } from "../assets/assets";

// Define the shape of the context value
interface AppContextType {
  doctors: typeof doctors;
  currencySymbol: string;
}

// Create context with a default value
export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const currencySymbol = "₹";

  const value: AppContextType = {
    doctors,
    currencySymbol,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
