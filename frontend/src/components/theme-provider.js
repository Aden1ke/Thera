"use client" // This directive is specific to Next.js App Router and can be removed for pure React.

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Create a Theme Context
const ThemeContext = createContext(undefined);

// 2. Create a custom hook to use the theme context
// This makes it easy for any component to access the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// 3. Create the ThemeProvider component
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
  const [theme, setThemeState] = useState(() => {
    // Initialize theme from local storage or system preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme) {
        return savedTheme;
      }
      if (defaultTheme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    }
    return defaultTheme;
  });

  // Effect to apply the theme class to the documentElement (e.g., <html> tag)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark"); // Remove existing classes

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Persist the theme to local storage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Function to change the theme
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  // Provide the theme value and setter function to children
  const value = {
    theme,
    setTheme,
    // You might want to expose other utilities like 'resolvedTheme'
    // if you have a more complex 'system' theme logic that needs to tell
    // you the *actual* applied theme (light/dark) after system preference.
    // For this basic setup, 'theme' itself represents the active choice.
    resolvedTheme: theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
