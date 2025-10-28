import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { getUser, clearUser } from '../utils/auth';
import gsApi from '../api/gsApi';
import Icon from 'react-native-vector-icons/Feather';
import LoaderModal from '../screens/LoaderModal'; // <-- Import here

const screenWidth = Dimensions.get('window').width;

export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [panchayats, setPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const u = await getUser();
        setUser(u || null);
        if (u && u.assigned_clf_id) {
          const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
          setPanchayats(Array.isArray(res) ? res : []);
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

  useEffect(() => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [menuOpen, slideAnim]);

  const logout = async () => {
    setMenuOpen(false);
    await clearUser();
    navigation.replace('Login');
  };

  const handleViewBeneficiaries = () => {
    setViewModalOpen(true);
    setTimeout(() => {
      setViewModalOpen(false);
      navigation.navigate('SelectGP', { viewOnly: true });
    }, 1600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Icon name="user" size={28} color="#EE6969" style={{ marginRight: 8 }} />
          <Text style={styles.userText}>{user ? user.username : 'User'}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Icon name="menu" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Slide-in Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
            activeOpacity={1}
          />
          <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <View style={styles.menuRow}>
                <Icon name="log-out" size={20} color="#EE6969" />
                <Text style={styles.menuText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Reusable Loader Modal */}
      <LoaderModal visible={viewModalOpen} message="Opening recorded beneficiaries" />

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SelectGP')}
        >
          <Text style={styles.primaryButtonText}>Record New Beneficiaries Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewBeneficiaries}>
          <Text style={styles.secondaryButtonText}>View Recorded Beneficiaries</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
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
  userText: {
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    marginTop: 50,
    marginRight: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#EE6969',
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#EE6969',
    borderRadius: 6,
    paddingVertical: 12,
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
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#EE6969',
    fontWeight: '500',
  },
});
