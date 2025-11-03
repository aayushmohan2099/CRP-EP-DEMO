// src/components/LanguageToggle.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function LanguageToggle({ language, setLanguage, style }) {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => setLanguage('en')}
        style={[
          styles.button,
          language === 'en' ? styles.activeButton : styles.inactiveButton,
          { marginRight: 8 },
        ]}
      >
        <Text style={language === 'en' ? styles.activeText : styles.inactiveText}>
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setLanguage('hi')}
        style={[
          styles.button,
          language === 'hi' ? styles.activeButton : styles.inactiveButton,
        ]}
      >
        <Text style={language === 'hi' ? styles.activeText : styles.inactiveText}>
          हिंदी
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  button: {
    padding: 6,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#EE6969',
  },
  inactiveButton: {
    backgroundColor: '#E8F5E9',
  },
  activeText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#000',
    fontWeight: '600',
  },
});
