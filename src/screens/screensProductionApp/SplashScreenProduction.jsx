import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../../utils/auth';
import gsApi, { setAuthToken } from '../../api/gsApi';
import { clearAllTemp } from '../../utils/tempStore';

export default function SplashScreenProduction() {
  const nav = useNavigation();

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        // Clear any stale temp state on app start
        clearAllTemp();

        const user = await getUser();
        if (!active) return;

        if (user && user.access) {
          setAuthToken(user.access);
          const role = String(user.role || '').toLowerCase();
          if (role === 'crp') {
            nav.replace('CRPDashboard');
            return;
          }
          if (role === 'admin') {
            nav.replace('AdminDashboard');
            return;
          }
        }
        nav.replace('Login');
      } catch (err) {
        nav.replace('Login');
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [nav]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('../../../assets/logo.png')}
        style={{ width: 160, height: 160, marginBottom: 20 }}
      />
      <ActivityIndicator size="large" />
      <Text style={{ position: 'absolute', bottom: 20 }}>
        Powered by BDO&apos;s RN Engine
      </Text>
    </View>
  );
}
