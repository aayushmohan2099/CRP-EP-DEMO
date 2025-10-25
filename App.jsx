import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import CRPDashboard from './src/screens/CRPDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import SelectGP from './src/screens/record/SelectGP';
import VillageList from './src/screens/record/VillageList';
import SHGList from './src/screens/record/SHGList';
import BeneficiaryList from './src/screens/record/BeneficiaryList';
import EnterpriseForm from './src/screens/record/EnterpriseForm';

const Stack = createNativeStackNavigator();

export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="SelectGP" component={SelectGP} />
        <Stack.Screen name="VillageList" component={VillageList} />
        <Stack.Screen name="SHGList" component={SHGList} />
        <Stack.Screen name="BeneficiaryList" component={BeneficiaryList} />
        <Stack.Screen name="EnterpriseForm" component={EnterpriseForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
