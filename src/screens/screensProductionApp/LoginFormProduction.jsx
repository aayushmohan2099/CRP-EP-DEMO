import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LanguageContext } from "../../components/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle";

// --- Default captcha generator ---
function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { q: `${a} + ${b}`, ans: String(a + b) };
}

// --- Translation dictionary ---
const translations = {
  en: {
    loginTitle: "Login",
    username: "Username",
    password: "Password",
    role: "Role",
    captcha: "Captcha",
    enterUsername: "Enter Username",
    enterPassword: "Enter Password",
    enterCaptcha: "Enter Answer",
    logIn: "Log In",
    refresh: "↻",
    loginSuccess: "Login successful!",
    usernameRequired: "Please enter username.",
    passwordRequired: "Please enter password.",
    captchaIncorrect: "Incorrect captcha.",
  },
  hi: {
    loginTitle: "लॉगिन",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    role: "भूमिका",
    captcha: "कैप्चा",
    enterUsername: "उपयोगकर्ता नाम दर्ज करें",
    enterPassword: "पासवर्ड दर्ज करें",
    enterCaptcha: "उत्तर दर्ज करें",
    logIn: "लॉग इन करें",
    refresh: "↻",
    loginSuccess: "सफलतापूर्वक लॉगिन!",
    usernameRequired: "कृपया उपयोगकर्ता नाम दर्ज करें।",
    passwordRequired: "कृपया पासवर्ड दर्ज करें।",
    captchaIncorrect: "कैप्चा गलत है।",
  },
};

export default function LoginForm({
  navigation,
  onSuccess, // function called after successful login
  roles = ["CRP", "Admin"],
  enableCaptcha = true,
  nextScreen = "CRPDashboard", // default next screen
  containerStyle = {},
  buttonColor = "#EE6969",
}) {
  const { language: lang } = useContext(LanguageContext);
  const t = translations[lang] || translations.en;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [captcha, setCaptcha] = useState(randomCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Refresh captcha
  const refreshCaptcha = useCallback(() => {
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptcha(randomCaptcha());
      setCaptchaInput("");
      setCaptchaLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (enableCaptcha) refreshCaptcha();
  }, [enableCaptcha, refreshCaptcha]);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = t.usernameRequired;
    if (!password.trim()) newErrors.password = t.passwordRequired;
    if (enableCaptcha && String(captchaInput).trim() !== String(captcha.ans)) {
      newErrors.captcha = t.captchaIncorrect;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fake login handler
  const handleSubmit = async () => {
    setSuccess("");
    if (!validate()) return;
    setLoading(true);

    // ⏳ Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(t.loginSuccess);

      // Optional callback for parent
      onSuccess?.({ username, role: selectedRole });

      // ✅ Navigate after success
      setTimeout(() => {
        if (navigation) {
          if (selectedRole === "Admin") {
            navigation.replace("AdminDashboard");
          } else {
            navigation.replace(nextScreen);
          }
        }
      }, 700);
    }, 1000);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{t.loginTitle}</Text>

      {/* Username */}
      <Text style={styles.label}>{t.username}</Text>
      <TextInput
        placeholder={t.enterUsername}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          if (text.trim()) setErrors((prev) => ({ ...prev, username: "" }));
        }}
        style={[styles.input, { borderColor: errors.username ? "red" : "#ccc" }]}
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.error}>{errors.username}</Text>}

      {/* Password */}
      <Text style={styles.label}>{t.password}</Text>
      <TextInput
        placeholder={t.enterPassword}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (text.trim()) setErrors((prev) => ({ ...prev, password: "" }));
        }}
        secureTextEntry
        style={[styles.input, { borderColor: errors.password ? "red" : "#ccc" }]}
        autoCapitalize="none"
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {/* Role selector */}
      {roles.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>{t.role}</Text>
          <View style={styles.roleRow}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  selectedRole === role && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === role && styles.roleTextSelected,
                  ]}
                >
                  {lang === "hi"
                    ? role === "Admin"
                      ? "प्रशासक"
                      : "सीआरपी"
                    : role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Captcha */}
      {enableCaptcha && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>
            {t.captcha}: {captcha.q}
          </Text>
          <View style={styles.captchaRow}>
            <View style={{ flex: 1, position: "relative" }}>
              <TextInput
                placeholder={t.enterCaptcha}
                value={captchaInput}
                onChangeText={(text) => {
                  setCaptchaInput(text);
                  if (text.trim() === captcha.ans)
                    setErrors((prev) => ({ ...prev, captcha: "" }));
                }}
                style={[
                  styles.input,
                  {
                    borderColor: errors.captcha ? "red" : "#ccc",
                    paddingRight: 35,
                  },
                ]}
                autoCapitalize="none"
              />
              {captchaLoading && (
                <ActivityIndicator
                  size="small"
                  color={buttonColor}
                  style={styles.captchaLoaderInside}
                />
              )}
            </View>
            <TouchableOpacity
              onPress={refreshCaptcha}
              disabled={loading || captchaLoading}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>{t.refresh}</Text>
            </TouchableOpacity>
          </View>
          {errors.captcha && <Text style={styles.error}>{errors.captcha}</Text>}
        </View>
      )}

      {success && <Text style={styles.successMsg}>{success}</Text>}

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: buttonColor },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{t.logIn}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { maxWidth: 400, width: "100%", alignSelf: "center", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#EE6969",
  },
  label: { fontSize: 14, color: "#333", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    color: "#000",
    backgroundColor: "#fff",
  },
  error: { color: "red", fontSize: 12, marginBottom: 6 },
  roleRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  roleButtonSelected: { backgroundColor: "#EE6969", borderColor: "#EE6969" },
  roleText: { color: "#000" },
  roleTextSelected: { color: "#fff" },
  captchaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  refreshButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F9ECEC",
    borderRadius: 6,
  },
  refreshText: { fontSize: 18, color: "#EE6969" },
  captchaLoaderInside: { position: "absolute", right: 10, top: "35%" },
  successMsg: { color: "green", marginTop: 8, textAlign: "center" },
  submitButton: {
    marginTop: 20,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "600", fontSize: 16 },
});
