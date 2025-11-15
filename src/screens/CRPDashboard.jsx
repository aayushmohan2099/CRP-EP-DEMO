import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';

import { getUser, clearUser } from '../utils/auth';
import gsApi from '../api/gsApi'; 
import LoaderModal from './LoaderModal'; 
import BurgerMenu from './BurgerMenu';   
import LanguageToggle from '../components/LanguageToggle'; 
import { LanguageContext } from '../components/LanguageContext'; 

import HamburgerIcon from '../../assets/hamburger.png'; 


export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { language } = useContext(LanguageContext); 


  const translations = {
    en: {
      recordBeneficiaries: 'Record New Beneficiaries Detail',
      viewBeneficiaries: 'View Recorded Beneficiaries',
      logout: 'Logout',
      openingBeneficiaries: 'Opening recorded beneficiaries',
      userPlaceholder: 'User',
    },
    hi: {
      recordBeneficiaries: 'नए लाभार्थियों का विवरण रिकॉर्ड करें',
      viewBeneficiaries: 'रिकॉर्ड किए गए लाभार्थियों देखें',
      logout: 'लॉग आउट',
      openingBeneficiaries: 'रिकॉर्ड किए गए लाभार्थियों को खोल रहे हैं',
      userPlaceholder: 'उपयोगकर्ता',
    },
  };

  const t = translations[language] || translations.en;

  
  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u || null);
    })();
  }, []);

  
  const handleViewBeneficiaries = () => {
    setViewModalOpen(true);
    setTimeout(() => {
      setViewModalOpen(false);
      navigation.navigate('SelectGP', { viewOnly: true });
    }, 1500);
  };

 
  const menuItems = [
    {
      label: t.logout,
      onPress: async () => {
        await clearUser();
        navigation.replace('Login');
      },
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userText}>
          {user ? user.username : t.userPlaceholder}
        </Text>

        <View style={styles.headerRight}>
          <LanguageToggle />

          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={{ marginLeft: 12 }}
          >
            <Image source={HamburgerIcon} style={styles.hamburgerIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('SelectGP')}
      >
        <Text style={styles.primaryButtonText}>
          {t.recordBeneficiaries}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleViewBeneficiaries}
      >
        <Text style={styles.secondaryButtonText}>
          {t.viewBeneficiaries}
        </Text>
      </TouchableOpacity>
      <LoaderModal visible={viewModalOpen} message={t.openingBeneficiaries} />
      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hamburgerIcon: {
    width: 28,
    height: 28,
  },
  primaryButton: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#EE6969',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#EE6969',
    fontWeight: '500',
  },
});
