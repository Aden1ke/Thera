// src/components/SignupPage.js

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// Corrected paths for ui components relative to sign
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea"; // Still needed for other text areas if any, otherwise can be removed
import { Checkbox } from "./ui/checkbox";
import {
  EyeIcon,
  EyeOffIcon,
  ArrowLeft,
  ArrowRight,
  User,
  Shield,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useTheme } from './theme-provider'; // Correct path for your custom theme-provider

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedEmergencyContact, setAcceptedEmergencyContact] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // Now correctly used to pick the background image

  const [formData, setFormData] = useState({
    // Account details
    email: "",
    password: "",
    confirmPassword: "",

    // Personal information
    fullName: "", // This is where the user types their full name
    phone: "",
    // bio: "", // <--- REMOVED

    // Emergency contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyEmail: "",
    emergencyPhone: "",
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (!formData.email) return "Email is required";
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Please enter a valid email";
      if (!formData.password) return "Password is required";
      if (formData.password.length < 8) return "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    }

    if (step === 2) {
      if (!formData.fullName) return "Full name is required";
      if (!formData.phone) return "Phone number is required";
    }

    if (step === 3) {
      if (!formData.emergencyName) return "Emergency contact name is required";
      if (!formData.emergencyPhone) return "Emergency contact phone is required";
      if (!formData.emergencyEmail) return "Emergency contact email is required";
      if (!/^\S+@\S+\.\S+$/.test(formData.emergencyEmail)) return "Please enter a valid emergency contact email";
    }

    if (step === 4) {
      if (!acceptedTerms) return "Please accept the Terms and Conditions";
      if (!acceptedEmergencyContact) return "Please acknowledge the Emergency Contact Policy";
    }

    return null;
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Destructure relevant fields for the API call
      const { email, password, fullName, phone, emergencyName, emergencyRelationship, emergencyEmail, emergencyPhone } = formData;

      // Split fullName into firstName and lastName to match backend model
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || ''; // Takes the first word
      const lastName = nameParts.slice(1).join(' ') || ''; // Takes the rest, handling multiple last names

      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'; // Fallback for safety

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send required fields to the backend, including derived firstName and lastName
        body: JSON.stringify({
          username: email, // Sending email as username as discussed
          email,
          password,
          firstName, // Sending parsed first name
          lastName,  // Sending parsed last name
          phone,
          emergencyContact: {
            name: emergencyName,
            relationship: emergencyRelationship,
            email: emergencyEmail,
            phone: emergencyPhone,
          }
          // 'bio' is intentionally not sent as it was removed from the form
        }),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const errorText = await response.text(); // Get raw text
        console.error('Frontend: Received non-JSON response from server:', errorText);
        throw new Error(`Unexpected server response. Status: ${response.status}. Expected JSON, got ${contentType || 'text/html'}.`);
      }

      if (response.ok) {
        localStorage.setItem(
          "thera_user_profile",
          JSON.stringify(data.user),
        );
        localStorage.setItem(
          "thera_auth",
          JSON.stringify({
            isAuthenticated: true,
            user: data.user,
            token: data.token,
            timestamp: Date.now(),
          }),
        );
        navigate("/");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Frontend Signup Error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const renderStepIndicator = (currentStepNum) => (
    <div className="flex justify-center space-x-2 mb-6">
      {[1, 2, 3, 4].map((stepNum) => (
        <div
          key={stepNum}
          className={`w-8 h-2 rounded-full ${
            stepNum <= currentStepNum
              ? "bg-green-600 dark:bg-green-400"
              : "bg-green-200 dark:bg-green-800"
          }`}
        />
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-300 text-center text-2xl">Create Account</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-400 text-center">
                Begin your healing journey with Thera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-700 dark:text-green-400">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
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
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
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
                  <p className="text-xs text-green-600 dark:text-green-500">Must be at least 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-green-700 dark:text-green-400">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"} // Assuming you want to toggle both with one eye icon
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      required
                      className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 pr-10"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                <CardTitle className="text-green-800 dark:text-green-300 text-center text-2xl">
                  Personal Information
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-400 text-center">
                Tell us about yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-green-700 dark:text-green-400">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    required
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-green-700 dark:text-green-400">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    required
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
                {/* REMOVED Bio field from here */}
              </form>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                <CardTitle className="text-green-800 dark:text-green-300 text-center text-2xl">
                  Emergency Contact
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-400 text-center">
                Your safety is our priority. This contact will be reached in critical situations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName" className="text-green-700 dark:text-green-400">
                    Full Name
                  </Label>
                  <Input
                    id="emergencyName"
                    placeholder="Emergency contact's full name"
                    value={formData.emergencyName}
                    onChange={(e) => updateFormData("emergencyName", e.target.value)}
                    required
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship" className="text-green-700 dark:text-green-400">
                    Relationship
                  </Label>
                  <Input
                    id="emergencyRelationship"
                    placeholder="e.g., Parent, Sibling, Friend"
                    value={formData.emergencyRelationship}
                    onChange={(e) => updateFormData("emergencyRelationship", e.target.value)}
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyEmail" className="text-green-700 dark:text-green-400">
                    Email
                  </Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    placeholder="contact.email@example.com"
                    value={formData.emergencyEmail}
                    onChange={(e) => updateFormData("emergencyEmail", e.target.value)}
                    required
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="text-green-700 dark:text-green-400">
                    Phone Number
                  </Label>
                  <Input
                    id="emergencyPhone"
                    placeholder="+1 (555) 987-6543"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
                    required
                    className="bg-white/80 dark:bg-black/50 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  />
                </div>
              </form>
            </CardContent>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                <CardTitle className="text-green-800 dark:text-green-300 text-center text-2xl">
                  Terms & Policies
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-400 text-center">
                Please review and accept our terms and policies to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                  className="border-green-300 dark:border-green-700"
                />
                <Label htmlFor="terms" className="text-sm text-green-700 dark:text-green-400 cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-green-800 dark:text-green-300 hover:underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-green-800 dark:text-green-300 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="emergencyContactPolicy"
                  checked={acceptedEmergencyContact}
                  onCheckedChange={setAcceptedEmergencyContact}
                  className="border-green-300 dark:border-green-700"
                />
                <Label htmlFor="emergencyContactPolicy" className="text-sm text-green-700 dark:text-green-400 cursor-pointer">
                  I acknowledge and understand Thera's Emergency Contact Policy, which states my emergency contact will be
                  notified if distress levels become critical.
                </Label>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-3 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-200/50 dark:border-red-800/50"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-700 dark:text-red-400">
                    <p className="font-medium mb-1">Important Notice</p>
                    <p>
                      Thera is an AI companion and not a substitute for professional medical advice or therapy. If you are
                      experiencing a crisis, please contact emergency services immediately.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            // **Corrected Image Paths and using 'theme' variable**
            backgroundImage:
              theme === "dark" ? "url('/dark-forest-plant.jpg')" : "url('/bright-waterfall.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      </div>


      <div className="w-full max-w-md z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo */}
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
          <Card className="w-full bg-white/70 dark:bg-black/60 backdrop-blur-md border-green-200 dark:border-green-800 shadow-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: step > 1 ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step > 1 ? -50 : 50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 dark:text-red-400 text-center mt-4 px-6 text-sm flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.p>
            )}
            <CardFooter className="flex justify-between mt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="w-24 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              {step < 4 && (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-24 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 ml-auto"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              )}
            </CardFooter>
            <p className="text-center text-sm text-green-700 dark:text-green-400 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-green-800 dark:text-green-300 hover:underline">
                Sign In
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
