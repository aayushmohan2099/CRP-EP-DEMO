import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/screensProductionApp/SplashScreenProduction';
import  LoginScreen from './src/screens/screensProductionApp/LoginScreenProduction';
import AdminDashboard from './src/screens/screensProductionApp/AdminDashboardProduction';
import SelectDistrict from './src/screens/screensProductionApp/SelectDistrict';
import BlockList from './src/screens/screensProductionApp/BlockList';
import SelectGP from './src/screens/screensProductionApp/SelectGP';
import SelectVillage from './src/screens/screensProductionApp/SelectVillages'
import { LanguageProvider } from './src/components/LanguageContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="SelectDistrict" component={SelectDistrict} />
          <Stack.Screen name="BlockList" component={BlockList} />
          <Stack.Screen name="SelectGP" component={SelectGP} />
          <Stack.Screen name="SelectVillages" component={SelectVillage} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
