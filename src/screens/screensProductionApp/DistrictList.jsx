// 

// screens/DistrictList.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import gsApi from '../api/api'; // your api.js

export default function DistrictList() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDistricts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      // Assuming your API supports pagination via query param ?page=
      const res = await gsApi.getDistricts(pageNumber); 
      if (res?.results) {
        setDistricts(res.results);
        setTotalPages(res.total_pages || 1); // assuming API returns total_pages
        setPage(pageNumber);
      } else {
        setDistricts([]);
      }
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts(1); // initial load
  }, []);

  const handleNext = () => {
    if (page < totalPages) fetchDistricts(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) fetchDistricts(page - 1);
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#EE6969" />}
      
      <FlatList
        data={districts}
        keyExtractor={(item) => item.district_id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.district_name_en} ({item.district_short_name_en})</Text>
        )}
      />

      {/* Pagination Buttons */}
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={page === 1 || loading}
          style={[styles.button, page === 1 && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>{page} / {totalPages}</Text>

        <TouchableOpacity
          onPress={handleNext}
          disabled={page === totalPages || loading}
          style={[styles.button, page === totalPages && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  item: { fontSize: 16, paddingVertical: 8 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 12 },
  button: { backgroundColor: '#EE6969', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginHorizontal: 8 },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  pageText: { fontSize: 16, fontWeight: '600' },
});
