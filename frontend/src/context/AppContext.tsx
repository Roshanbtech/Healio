import React, { createContext, ReactNode, useState } from "react";
import { doctors } from "../assets/assets";

interface AppContextType {
  doctors: typeof doctors;
  currencySymbol: string;
  token: string | null;
  userImage: string | null;
  setAuth: (token: string | null, image: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  // Initialize token and userImage from localStorage
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [userImage, setUserImage] = useState<string | null>(localStorage.getItem("image"));

  const currencySymbol = "₹";

  // setAuth updates both state and localStorage
  const setAuth = (newToken: string | null, newImage: string | null) => {
    setToken(newToken);
    setUserImage(newImage);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
    if (newImage) {
      localStorage.setItem("image", newImage);
    } else {
      localStorage.removeItem("image");
    }
  };

  const value: AppContextType = {
    doctors,
    currencySymbol,
    token,
    userImage,
    setAuth,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
