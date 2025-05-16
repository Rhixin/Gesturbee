import Toast from "@/components/Toast";
import React, { createContext, useContext, useState } from "react";

// Define types for our context
type ToastType = "success" | "error" | "info" | "warning";

type ToastContextType = {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: () => void;
};

// Create the context with default values
const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

// Create a provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [duration, setDuration] = useState(3000);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration = 3000
  ) => {
    setMessage(message);
    setType(type);
    setDuration(duration);
    setVisible(true);
  };

  const hideToast = () => {
    setVisible(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        type={type}
        onDismiss={hideToast}
        duration={duration}
        position="top"
      />
    </ToastContext.Provider>
  );
};

// Create a custom hook to use the toast context
export const useToast = () => useContext(ToastContext);
