// // src/context/LanguageContext.jsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState("en");

//   // Load language from AsyncStorage on app start
//   useEffect(() => {
//     const loadLanguage = async () => {
//       try {
//         const lang = await AsyncStorage.getItem("appLanguage");
//         if (lang) setLanguage(lang);
//       } catch (error) {
//         console.error("Failed to load language:", error);
//       }
//     };
//     loadLanguage();
//   }, []);

//   // Function to change language and save it persistently
//   const changeLanguage = async (lang) => {
//     try {
//       setLanguage(lang);
//       await AsyncStorage.setItem("appLanguage", lang);
//     } catch (error) {
//       console.error("Failed to save language:", error);
//     }
//   };

//   return (
//     <LanguageContext.Provider value={{ language, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Load saved language when app starts
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("appLanguage");
        if (savedLang) {
          setLanguage(savedLang);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
    };
    loadLanguage();
  }, []);

  // Change language and save persistently
  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem("appLanguage", lang);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
