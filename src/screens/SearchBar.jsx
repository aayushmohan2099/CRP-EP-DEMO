// components/SearchBar.jsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function SearchBar({ value, onChangeText, placeholder, style }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.input, style]} // merge default and custom styles
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#EE6969',
    padding: 8,
    borderRadius: 6,
  },
});
