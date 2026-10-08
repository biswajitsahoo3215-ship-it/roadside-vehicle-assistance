import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      "Failed to read saved user:",
      error
    );

    localStorage.removeItem("user");

    return null;
  }
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    if (!payload.exp) {
      return false;
    }

    return (
      payload.exp * 1000 <
      Date.now()
    );
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(() => {
    const token =
      localStorage.getItem("token");

    const savedUser = getStoredUser();

    if (!token || !savedUser) {
      return null;
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    }

    return savedUser;
  });

  const login = (
    userData,
    token
  ) => {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  useEffect(() => {
    const checkToken = () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        if (user) {
          setUser(null);
        }

        return;
      }

      if (isTokenExpired(token)) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setUser(null);
      }
    };

    checkToken();

    const interval = setInterval(
      checkToken,
      60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated:
          !!user &&
          !!localStorage.getItem(
            "token"
          )
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};