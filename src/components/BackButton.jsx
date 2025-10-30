import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BackButton(){
  const nav = useNavigation();
  return (
    <TouchableOpacity onPress={() => nav.goBack()}  style={{
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 12,
    borderRadius: 6, 
    borderWidth: 1,
    borderColor: '#EE6969',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  }}>
      <Text style={{ color:'#EE6969' }}>Back</Text>
    </TouchableOpacity>
  );
}
