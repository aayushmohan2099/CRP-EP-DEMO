// // App.jsx
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import SplashScreen from './src/screens/SplashScreen';
// import LoginScreen from './src/screens/LoginScreen';
// import CRPDashboard from './src/screens/CRPDashboard';
// import AdminDashboard from './src/screens/AdminDashboard';
// import SelectGP from './src/screens/record/SelectGP';
// import VillageList from './src/screens/record/VillageList';
// import SHGList from './src/screens/record/SHGList';
// import BeneficiaryList from './src/screens/record/BeneficiaryList';
// import EnterpriseForm from './src/screens/record/EnterpriseForm';
// import ViewBeneficiary from './src/screens/record/ViewBeneficiary';

// const Stack = createNativeStackNavigator();

// export default function App(){
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
//         <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//         <Stack.Screen name="SelectGP" component={SelectGP} />
//         <Stack.Screen name="VillageList" component={VillageList} />
//         <Stack.Screen name="SHGList" component={SHGList} />
//         <Stack.Screen name="BeneficiaryList" component={BeneficiaryList} />
//         <Stack.Screen name="EnterpriseForm" component={EnterpriseForm} />
//         <Stack.Screen name="ViewBeneficiary" component={ViewBeneficiary} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }



// App.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import SplashScreen from './src/screens/SplashScreen';
import  LoginScreen from './src/screens/screensProductionApp/LoginScreenProduction';
import AdminDashboard from './src/screens/screensProductionApp/AdminDashboardProduction';
// import DistrictList from './src/screens/screensProductionApp/DistrictList';
import SelectDistrict from './src/screens/screensProductionApp/SelectDistrict';
import BlockList from './src/screens/screensProductionApp/BlockList';
import SelectGP from './src/screens/screensProductionApp/SelectGP';
import SelectVillage from './src/screens/screensProductionApp/SelectVillages'
// import LoginScreen from './src/screens/LoginScreen';
// import CRPDashboard from './src/screens/CRPDashboard';
// import AdminDashboard from './src/screens/AdminDashboard';
// import SelectGP from './src/screens/record/SelectGP';
// import VillageList from './src/screens/record/VillageList';
// import SHGList from './src/screens/record/SHGList';
// import BeneficiaryList from './src/screens/record/BeneficiaryList';
// import EnterpriseForm from './src/screens/record/EnterpriseForm';
// import ViewBeneficiary from './src/screens/record/ViewBeneficiary';

// ✅ Import the LanguageProvider from your context file
import { LanguageProvider } from './src/components/LanguageContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // ✅ Wrap everything inside the LanguageProvider
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
<Stack.Screen name="SelectDistrict" component={SelectDistrict} />
<Stack.Screen name="BlockList" component={BlockList} />
<Stack.Screen name="SelectGP" component={SelectGP} />
<Stack.Screen name="SelectVillages" component={SelectVillage} />
          {/* <Stack.Screen name="DistrictList" component={DistrictList} /> */}
          {/* <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="SelectGP" component={SelectGP} />
          <Stack.Screen name="VillageList" component={VillageList} `/>
          <Stack.Screen name="SHGList" component={SHGList} />
          <Stack.Screen name="BeneficiaryList" component={BeneficiaryList} />
          <Stack.Screen name="EnterpriseForm" component={EnterpriseForm} />
          <Stack.Screen name="ViewBeneficiary" component={ViewBeneficiary} /> */}

          
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
