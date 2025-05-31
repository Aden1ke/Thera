// /data/data/com.termux/files/home/Thera/frontend/src/components/profile-page.js
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import { Textarea } from "./../components/ui/textarea";
import { ArrowLeft, User, Heart, Shield, Save } from "lucide-react";
import EmotionalProgressBar from "./emotional-progress-bar";
import { Button } from './../components/ui/button';

export default function ProfilePage({ onBack, emotionalState }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: {
      name: "",
      email: "",
      phone: "",
      relationship: "",
    },
    bio: "",
    joinDate: new Date().toISOString().split("T")[0],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true); // New loading state
  const [profileError, setProfileError] = useState(""); // New error state

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const triggerEmergencyContact = useCallback(async () => {
    try {
      console.log("🚨 EMERGENCY: Contacting emergency contact", profile.emergencyContact);

      await fetch(`${API_BASE_URL}/api/emergency-contact`, { // Use API_BASE_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          emotionalState,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to send emergency notification:", error);
    }
  }, [profile, emotionalState, API_BASE_URL]); // Add API_BASE_URL to dependencies

  useEffect(() => {
    const position = 50 + (emotionalState.wellness - emotionalState.distress) / 2;
    if (position <= 15 && profile.emergencyContact.email) {
      triggerEmergencyContact();
    }
  }, [emotionalState, profile.emergencyContact, triggerEmergencyContact]);

  // Function to fetch user profile from the backend
  const fetchUserProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const authData = JSON.parse(localStorage.getItem("thera_auth"));
      if (!authData || !authData.isAuthenticated || !authData.user || !authData.token) {
        setProfileError("User not authenticated.");
        setLoadingProfile(false);
        return;
      }

      const userId = authData.user._id || authData.user.id; // Get user ID from stored data
      if (!userId) {
        setProfileError("User ID not found in authentication data.");
        setLoadingProfile(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.token}`, // Send the JWT token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile data.");
      }

      const data = await response.json();
      setProfile(prevProfile => ({
        ...prevProfile, // Keep default values for fields not returned by backend if necessary
        name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
        email: data.user.email,
        phone: data.user.phone || "",
        bio: data.user.bio || "",
        emergencyContact: {
          name: data.user.emergencyContact?.name || "",
          email: data.user.emergencyContact?.email || "",
          phone: data.user.emergencyContact?.phone || "",
          relationship: data.user.emergencyContact?.relationship || "",
        },
        joinDate: data.user.joinDate || (data.user.createdAt ? data.user.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
      }));
      // Also update the local storage with the full profile
      localStorage.setItem("thera_user_profile", JSON.stringify({
        name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
        email: data.user.email,
        phone: data.user.phone || "",
        bio: data.user.bio || "",
        emergencyContact: {
          name: data.user.emergencyContact?.name || "",
          email: data.user.emergencyContact?.email || "",
          phone: data.user.emergencyContact?.phone || "",
          relationship: data.user.emergencyContact?.relationship || "",
        },
        joinDate: data.user.joinDate || (data.user.createdAt ? data.user.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError(error.message);
    } finally {
      setLoadingProfile(false);
    }
  }, [API_BASE_URL]);

  // Load profile data from localStorage on component mount OR fetch from backend
  useEffect(() => {
    const storedProfile = localStorage.getItem("thera_user_profile");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
        setLoadingProfile(false); // If profile found locally, stop loading
      } catch (error) {
        console.error("Failed to parse stored profile:", error);
        // If parsing fails, try fetching from backend
        fetchUserProfile();
      }
    } else {
      // If no profile in localStorage, fetch from backend
      fetchUserProfile();
    }
  }, [fetchUserProfile]); // Depend on fetchUserProfile

  const handleSave = async () => {
    setIsSaving(true);
    setProfileError(""); // Clear previous errors

    try {
      const authData = JSON.parse(localStorage.getItem("thera_auth"));
      if (!authData || !authData.isAuthenticated || !authData.user || !authData.token) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const userId = authData.user._id || authData.user.id; // Get user ID
      if (!userId) {
        throw new Error("User ID not found for saving profile.");
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT", // Or PATCH for partial updates
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          // Send only the fields that can be updated by the user
          // Ensure your backend's update route handles these fields
          name: profile.name, // If your backend expects a combined name
          firstName: profile.name.split(' ')[0], // Or derive firstName/lastName from 'name' if schema needs it
          lastName: profile.name.split(' ').slice(1).join(' '),
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio,
          emergencyContact: profile.emergencyContact,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile.");
      }

      // If save is successful, update localStorage with the latest data from backend
      const updatedUserData = await response.json();
      localStorage.setItem("thera_user_profile", JSON.stringify(updatedUserData.user)); // Assuming backend returns updated user

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfile((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Removed the useEffect that saves on profile change, as we now save explicitly via handleSave
  // And update localStorage only after a successful backend save/fetch.

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-green-800 dark:text-green-300">Loading profile...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-600 dark:text-red-400">Error: {profileError}</p>
        {/* Optionally, add a retry button */}
        <Button onClick={fetchUserProfile} className="ml-4 bg-green-600 hover:bg-green-700 text-white">Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      {onBack && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-green-800 dark:text-green-300 hover:bg-white/20 dark:hover:bg-black/30 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-green-800 dark:text-green-200">{profile.name || "Your Profile"}</CardTitle>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    Member since {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={isSaving}
                className="bg-green-700/80 hover:bg-green-800 dark:bg-green-800/80 dark:hover:bg-green-900 text-white"
              >
                {isSaving ? (
                  "Saving..."
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : (
                  "Edit Profile"
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Emotional Wellness Overview */}
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
              Emotional Wellness Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EmotionalProgressBar
              wellness={emotionalState.wellness}
              distress={emotionalState.distress}
              className="px-2"
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-white/5 dark:bg-black/10 rounded-lg">
                <p className="text-green-700 dark:text-green-400">Current Wellness</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{emotionalState.wellness}%</p>
              </div>
              <div className="text-center p-3 bg-white/5 dark:bg-black/10 rounded-lg">
                <p className="text-green-700 dark:text-green-400">Distress Level</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{emotionalState.distress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => updateProfile("name", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">Phone</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">About You</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                disabled={!isEditing}
                className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                placeholder="Tell Thera a bit about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              Emergency Contact
            </CardTitle>
            <p className="text-green-700 dark:text-green-400 text-sm">
              This person will be contacted automatically if your emotional state reaches crisis level
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Contact Name
                </label>
                <Input
                  value={profile.emergencyContact.name}
                  onChange={(e) => updateProfile("emergencyContact.name", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Relationship
                </label>
                <Input
                  value={profile.emergencyContact.relationship}
                  onChange={(e) => updateProfile("emergencyContact.relationship", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="e.g., Mother, Friend, Partner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">Email</label>
                <Input
                  type="email"
                  value={profile.emergencyContact.email}
                  onChange={(e) => updateProfile("emergencyContact.email", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="emergency@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">Phone</label>
                <Input
                  value={profile.emergencyContact.phone}
                  onChange={(e) => updateProfile("emergencyContact.phone", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
