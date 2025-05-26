import AuthService from "@/api/services/auth-service";
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: getCurreent user api from gesturbee
  //   useEffect(() => {
  //     const loadUser = async () => {
  //       try {
  //         const userResponse = await AuthService.getCurrentUser();
  //         if (userResponse) {
  //           setCurrentUser(userResponse.data);
  //         }
  //       } catch (error) {
  //         console.error("Failed to load user:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     loadUser();
  //   }, []);

  const login = async (username, password) => {
    const user = await AuthService.login(username, password);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
  };

  const getCurrentUser = async () => {
    // TODO: use api ni joshua
    return currentUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        getCurrentUser,
        login,
        logout,
        //TODO: isAuthenticated not done yet
        isAuthenticated: true,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
