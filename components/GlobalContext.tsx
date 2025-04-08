import { useRouter } from "expo-router";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type User = {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  selectedRole: string;
} | null;

//Global Context
interface GlobalContextType {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  bubbleAnimation: any;
  setBubbleAnimation: (value: any) => void;
  progressAnimation: any;
  setProgressAnimation: (value: any) => void;
}

// Create the actual context with a default (dummy) value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    schoolName: "",
    selectedRole: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bubbleAnimation, setBubbleAnimation] = useState(null);
  const [progressAnimation, setProgressAnimation] = useState(null);

  useEffect(() => {
    setBubbleAnimation(require("../assets/animations/bubbles_yellow.json"));
    setProgressAnimation(require("../assets/animations/progress_bee.json"));
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        setIsLoading,
        bubbleAnimation,
        setBubbleAnimation,
        progressAnimation,
        setProgressAnimation,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook for consuming context easily
export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
