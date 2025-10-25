import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BackButton(){
  const nav = useNavigation();
  return (
    <TouchableOpacity onPress={() => nav.goBack()} style={{ padding:8 }}>
      <Text style={{ color:'#007aff' }}>Back</Text>
    </TouchableOpacity>
  );
}
