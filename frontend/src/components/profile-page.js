import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import { Textarea } from "./../components/ui/textarea";
import { ArrowLeft, User, Heart, Shield, Save, LogOut } from "lucide-react";
import EmotionalProgressBar from "./emotional-progress-bar";
import { Button } from './../components/ui/button';

export default function ProfilePage({ onBack, emotionalState, onLogout }) {
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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const triggerEmergencyContact = useCallback(async () => {
    try {
      console.log("🚨 EMERGENCY: Contacting emergency contact", profile.emergencyContact);

      await fetch(`${API_BASE_URL}/api/emergency-contact`, {
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
  }, [profile, emotionalState, API_BASE_URL]);

  useEffect(() => {
    const position = 50 + (emotionalState.wellness - emotionalState.distress) / 2;
    if (position <= 15 && profile.emergencyContact.email) {
      triggerEmergencyContact();
    }
  }, [emotionalState, profile.emergencyContact, triggerEmergencyContact]);

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

      const userId = authData.user._id || authData.user.id;
      if (!userId) {
        setProfileError("User ID not found in authentication data.");
        setLoadingProfile(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile data.");
      }

      const data = await response.json();
      const user = data.data.user;
      setProfile(prevProfile => ({
        ...prevProfile,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phone || "",
        bio: user.bio || "",
        emergencyContact: {
          name: user.emergencyContact?.name || "",
          email: user.emergencyContact?.email || "",
          phone: user.emergencyContact?.phone || "",
          relationship: user.emergencyContact?.relationship || "",
        },
        joinDate: user.joinDate || (user.createdAt ? user.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
      }));
      localStorage.setItem("thera_user_profile", JSON.stringify({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phone || "",
        bio: user.bio || "",
        emergencyContact: {
          name: user.emergencyContact?.name || "",
          email: user.emergencyContact?.email || "",
          phone: user.emergencyContact?.phone || "",
          relationship: user.emergencyContact?.relationship || "",
        },
        joinDate: user.joinDate || (user.createdAt ? user.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError(error.message);
    } finally {
      setLoadingProfile(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const storedProfile = localStorage.getItem("thera_user_profile");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
        setLoadingProfile(false);
      } catch (error) {
        console.error("Failed to parse stored profile:", error);
        fetchUserProfile();
      }
    } else {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    setProfileError("");

    try {
      const authData = JSON.parse(localStorage.getItem("thera_auth"));
      if (!authData || !authData.isAuthenticated || !authData.user || !authData.token) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const userId = authData.user._id || authData.user.id;
      if (!userId) {
        throw new Error("User ID not found for saving profile.");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          firstName: profile.name.split(' ')[0],
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

      const updatedUserData = await response.json();
      localStorage.setItem("thera_user_profile", JSON.stringify(updatedUserData.user));

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

  const handleLogout = () => {
    // Clear all authentication-related items from local storage
    localStorage.removeItem("thera_auth");
    localStorage.removeItem("thera_user_profile"); // Clear user profile data too

    if (onLogout) {
      onLogout();
    }
  };
 

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
        <Button onClick={fetchUserProfile} className="ml-4 bg-green-600 hover:bg-green-700 text-white">Retry</Button>
      </div>
    );
  }

  const emergencyContact = profile.emergencyContact || {
    name: "",
    email: "",
    phone: "",
    relationship: ""
  };

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
              <div className="flex items-center gap-2">
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
                {/* --- Logout Button --- */}
                <Button
                  onClick={handleLogout}
                  className="bg-red-600/80 hover:bg-red-700 dark:bg-red-700/80 dark:hover:bg-red-800 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                </div>
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
                  value={emergencyContact.name}
                  onChange={(e) => updateProfile("emergencyContact.name", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="Emergency Contact Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Relationship
                </label>
                <Input
                  value={emergencyContact.relationship}
                  onChange={(e) => updateProfile("emergencyContact.relationship", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="e.g., Parent, Friend"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={emergencyContact.email}
                  onChange={(e) => updateProfile("emergencyContact.email", e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                  placeholder="emergency@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Contact Phone
                </label>
                <Input
                  value={emergencyContact.phone}
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
