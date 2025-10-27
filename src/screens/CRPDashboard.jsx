// src/screens/CRPDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { getUser, clearUser } from '../utils/auth';
import gsApi from '../api/gsApi';


export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [panchayats, setPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const u = await getUser();
        setUser(u || null);
        if (u && u.assigned_clf_id) {
          const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
          if (Array.isArray(res)) setPanchayats(res);
          else setPanchayats([]);
        } else {
          setPanchayats([]);
        }
      } catch (err) {
        console.warn('CRPDashboard load error', err);
        Alert.alert('Error', String(err));
        setPanchayats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    setMenuOpen(false);
    await clearUser();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Image
            // source={require('../assets/user_icon.png')} // replace with your user icon
            style={styles.userIcon}
          />
          <Text style={styles.userText}>{user ? user.username : 'User'}</Text>
        </View>

        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Image
          
            source={require('../assets/burger_icon.png')} // replace with your burger menu icon
            style={styles.burgerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SelectGP')}
        >
          <Text style={styles.primaryButtonText}>Record New Beneficiaries Detail</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SelectGP', { viewOnly: true })}
        >
          <Text style={styles.secondaryButtonText}>View Recorded beneficiaries</Text>
        </TouchableOpacity>
      </View>

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  userText: {
    fontWeight: '600',
    fontSize: 16,
  },
  burgerIcon: {
    width: 28,
    height: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    marginTop: 50,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 8,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#EE6969',
    fontWeight: '600',
  },
  buttonGroup: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#EE6969',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#EE6969',
    fontWeight: '500',
  },
  noDataText: {
    color: '#888',
    padding: 10,
    textAlign: 'center',
  },
  panchayatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
