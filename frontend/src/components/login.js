// src/components/login.js
// Removed: "use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Label } from "./../components/ui/label";
import { Checkbox } from "./../components/ui/checkbox";
import { EyeIcon, EyeOffIcon, Shield } from "lucide-react";
import { useTheme } from './theme-provider';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme(); // Now correctly using your custom useTheme

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // In a pure React app, your API endpoint might be different.
      // If your backend is not on the same origin, you might need to use a full URL:
      // const response = await fetch("http://localhost:5000/api/auth/login", { // Example
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'; // Fallback for safety

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "thera_auth",
          JSON.stringify({
            isAuthenticated: true,
            user: data.data.user,
            token: data.data.token,
            timestamp: Date.now(),
          }),
        );
        navigate("/");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            // Now theme is correctly used from your custom theme-provider
            backgroundImage:
              theme === "dark" ? "url('/dark-forest-plant.jpg')" : "url('/bright-waterfall.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      </div>

      <div className="w-full max-w-md z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800 dark:from-green-700 dark:via-green-800 dark:to-green-900 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-2 bg-white/30 dark:bg-black/20 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <span className="text-2xl">🌿</span>
              </motion.div>
            </div>
          </div>

          <Card className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border-green-100 dark:border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-300 text-center text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-400 text-center">
                Sign in to continue your healing journey with Thera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-700 dark:text-green-400">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-green-700 dark:text-green-400">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-300"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-green-300 dark:border-green-700"
                  />
                  <Label htmlFor="remember" className="text-sm text-green-700 dark:text-green-400">
                    Remember me
                  </Label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 text-white"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>

                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-green-200 dark:border-green-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-black px-2 text-green-600 dark:text-green-400">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => navigate("/signup")}
              >
                Create an Account
              </Button>
            </CardFooter>
          </Card>

          {/* Emergency Contact Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm rounded-lg border border-green-200/50 dark:border-green-800/50"
          >
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-700 dark:text-green-400">
                <p className="font-medium mb-1">Your Safety Matters</p>
                <p>
                  Thera monitors your emotional wellness and will contact your emergency contact if distress levels
                  become critical.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
