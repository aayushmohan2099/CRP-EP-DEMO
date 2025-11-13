// screens/DistrictList.jsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';

export default function DistrictList({ route }) {
  const { districts } = route.params;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={districts}
        keyExtractor={(item) => item.district_id.toString()}
        renderItem={({ item }) => (
          <Text>{item.district_name_en} ({item.district_short_name_en})</Text>
        )}
      />
    </View>
  );
}
