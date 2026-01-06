// ModeContext.js
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const ModeContext = createContext({
  isDark: true,
  setMode: () => {},
});

const iframeContext = createContext({
  isiframe: false,
  setMode: () => {},
});

function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
      />
    </React.Fragment>
  );
}

export const useMode = () => useContext(ModeContext);
export const useMode2 = () => useContext(iframeContext);

export const ModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isiframe, setIsiframe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMode = window.localStorage.getItem("currentModeCC");
      let initialMode = prefersDarkMode;

      if (storedMode === "false") {
        initialMode = false;
      } else if (storedMode === "true") {
        initialMode = true;
      }

      setIsDark(initialMode);
      setIsLoading(false);
    }

    if (window.self !== window.top) {
      setIsiframe(true);
      setIsDark(false);
    } else {
      setIsiframe(false);
    }
  }, [prefersDarkMode]);

  const setMode = (mode) => {
    setIsDark(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("currentModeCC", mode);
    }
  };

  return (
    <iframeContext.Provider value={{ isiframe, setMode }}>
      <ModeContext.Provider value={{ isDark, setMode }}>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <GradientCircularProgress />
          </div>
        ) : (
          children
        )}
      </ModeContext.Provider>
    </iframeContext.Provider>
  );
};
