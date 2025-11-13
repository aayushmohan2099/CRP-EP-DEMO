import React, { useContext, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import LoginForm from "../screensProductionApp/LoginFormProduction";
import { saveUser } from "../../utils/auth";
import LanguageToggle from "../../components/LanguageToggle";
import { LanguageContext } from "../../components/LanguageContext";

export default function LoginScreen({ navigation }) {
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);

  // 🟢 Mock login function
  const handleLogin = async (username, password, role) => {
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    setLoading(false);

    // Simple validation
    if (!username || !password || !role) {
      Alert.alert("Error", "Please enter username, password, and select a role");
      return { success: false };
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        username,
        role,
      },
    };
  };

  // 🟢 Handle successful login
  const handleSuccess = async (user) => {
    await saveUser(user);

    const role = String(user.role || "").toLowerCase();

    if (role === "crp") navigation.replace("CRPDashboard");
    else if (role === "admin") navigation.replace("AdminDashboard");
    else {
      Alert.alert("Error", "Unknown role. Cannot navigate.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Language Toggle */}
      <LanguageToggle style={{ marginBottom: 20 }} />

      {/* Login Form */}
      <LoginForm
        title="Enterprise Sakhi Registration"
        buttonLabel="Sign In"
        roles={["CRP", "Admin"]}
        enableCaptcha={true}
        onLogin={handleLogin}
        onSuccess={handleSuccess}
        language={language}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: "#fff",
  },
});
