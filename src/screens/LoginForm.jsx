// src/components/LoginForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// --- Default captcha generator ---
function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { q: `${a} + ${b}`, ans: String(a + b) };
}

export default function LoginForm({
  onLogin,
  onSuccess,
  roles = ['CRP', 'Admin'],
  enableCaptcha = true,
  style = {},
  title = 'Login',
  buttonLabel = 'Log In',
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [captcha, setCaptcha] = useState(randomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false); // NEW
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptcha(randomCaptcha());
      setCaptchaInput('');
      setCaptchaLoading(false);
    }, 800); // short delay for loader
  }, []);

  useEffect(() => {
    if (enableCaptcha) refreshCaptcha();
  }, [enableCaptcha, refreshCaptcha]);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Please enter username.';
    if (!password.trim()) newErrors.password = 'Please enter password.';
    if (enableCaptcha && String(captchaInput).trim() !== String(captcha.ans)) {
      newErrors.captcha = 'Incorrect captcha.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSuccess('');
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await onLogin(username, password, selectedRole);
      if (res?.success) {
        setSuccess('Login successful!');
        setTimeout(() => onSuccess?.(res.user), 800);
      } else {
        setErrors({ general: res?.message || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ general: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        placeholder="Enter Username"
        placeholderTextColor="#999"
        value={username}
        autoCompleteType="off"
        autoCorrect={false}
        onChangeText={(text) => {
          setUsername(text);
          if (text.trim()) setErrors((prev) => ({ ...prev, username: '' }));
        }}
        style={[
          styles.input,
          { borderColor: errors.username ? 'red' : '#ccc' },
        ]}
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.error}>{errors.username}</Text>}

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Enter Password"
        placeholderTextColor="#999"
        value={password}
        autoCompleteType="off"
        autoCorrect={false}
        onChangeText={(text) => {
          setPassword(text);
          if (text.trim()) setErrors((prev) => ({ ...prev, password: '' }));
        }}
        secureTextEntry
        style={[
          styles.input,
          { borderColor: errors.password ? 'red' : '#ccc' },
        ]}
        autoCapitalize="none"
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {/* Role selection */}
      {roles.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  selectedRole === role && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole(role)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === role && styles.roleTextSelected,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Captcha */}
      {enableCaptcha && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Captcha: {captcha.q}</Text>
          <View style={styles.captchaRow}>
            <View style={{ flex: 1, position: 'relative' }}>
              <TextInput
                placeholder="Enter Answer"
                placeholderTextColor="#999"
                value={captchaInput}
                autoCompleteType="off"
                autoCorrect={false}
                onChangeText={(text) => {
                  setCaptchaInput(text);
                  if (text.trim() === captcha.ans)
                    setErrors((prev) => ({ ...prev, captcha: '' }));
                }}
                style={[
                  styles.input,
                  {
                    borderColor: errors.captcha ? 'red' : '#ccc',
                    paddingRight: 35, // make space for loader
                  },
                ]}
                autoCapitalize="none"
              />
              {/* Loader INSIDE the captcha input field */}
              {captchaLoading && (
                <ActivityIndicator
                  size="small"
                  color="#EE6969"
                  style={styles.captchaLoaderInside}
                />
              )}
            </View>
            <TouchableOpacity
              onPress={refreshCaptcha}
              disabled={loading || captchaLoading}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>↻</Text>
            </TouchableOpacity>
          </View>
          {errors.captcha && <Text style={styles.error}>{errors.captcha}</Text>}
        </View>
      )}

      {/* Messages */}
      {errors.general && <Text style={styles.errorMsg}>{errors.general}</Text>}
      {success && <Text style={styles.successMsg}>{success}</Text>}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#EE6969',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    color: '#000',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonSelected: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  roleText: {
    color: '#000',
  },
  roleTextSelected: {
    color: '#fff',
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  refreshButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
  },
  refreshText: {
    fontSize: 18,
    color: ' #EE6969',
  },
  captchaLoaderInside: {
    position: 'absolute',
    right: 10,
    top: '35%',
  },
  errorMsg: {
    color: 'red',
    marginTop: 8,
  },
  successMsg: {
    color: 'green',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#EE6969',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
