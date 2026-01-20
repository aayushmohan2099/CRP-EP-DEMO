import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";

import { pick } from "@react-native-documents/picker";

/* ---------------- LICENSE DATA ---------------- */
const licenseOptions = [
  {
    category: "Food, Health & Product Safety",
    options: [
      { label: "FSSAI License / Registration", value: "fssai" },
      { label: "FSSAI Basic Registration", value: "fssai_basic" },
      { label: "FSSAI State License", value: "fssai_state" },
      { label: "FSSAI Central License", value: "fssai_central" },
      { label: "AYUSH Manufacturing License", value: "ayush_manufacturing" },
      { label: "AYUSH License", value: "ayush_license" },
      { label: "AYUSH Certificate", value: "ayush_certificate" },
      { label: "BIS Certification", value: "bis" },
      { label: "BIS Certification (Toys)", value: "bis_toys" },
      { label: "Organic Certification", value: "organic_certification" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Business, Trade & Tax Registrations",
    options: [
      { label: "GST Registration", value: "gst" },
      { label: "MSME (Udyam) Registration", value: "msme" },
      { label: "Shop & Establishment Registration", value: "shop_establishment" },
      { label: "KVIC / Khadi & Village Industries Registration", value: "kvic" },
      { label: "Handloom Registration", value: "handloom" },
      { label: "Cooperative Society Registration", value: "cooperative_registration" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Environment, Pollution & Waste Management",
    options: [
      { label: "Pollution Control Board Consent / Clearance", value: "pcb_clearance" },
      { label: "Plastic Recycling Authorization", value: "plastic_recycling" },
      { label: "E-Waste Recycling Authorization", value: "ewaste_recycling" },
      { label: "Biogas Plant Approval", value: "biogas_approval" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Agriculture, Animal Husbandry & Fisheries",
    options: [
      { label: "Fisheries Department Registration", value: "fisheries_registration" },
      { label: "Local Animal Husbandry License", value: "animal_husbandry_license" },
      { label: "Dairy License (Local Authority)", value: "dairy_license" },
      { label: "Agriculture Produce Packaging Approval", value: "agri_packaging" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Tourism, Hospitality & Local Bodies",
    options: [
      { label: "Tourism Department Registration", value: "tourism_registration" },
      { label: "Homestay Registration", value: "homestay_registration" },
      { label: "Local Municipal / Nagar Palika License", value: "municipal_license" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Transport & Mobility",
    options: [
      { label: "RTO Registration", value: "rto_registration" },
      { label: "RTO Permit / Approval", value: "rto_permit" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Energy, Power & Utilities",
    options: [
      { label: "Electricity Board Approval", value: "electricity_board_approval" },
      { label: "Solar Installation Authorization", value: "solar_authorization" },
      { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "IT, Media & Communication",
    options: [{ label: "Cyber Café License", value: "cyber_cafe_license" }, { label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Storage & Infrastructure",
    options: [{ label: "Cold Storage License", value: "cold_storage_license" },{ label: "Other (Please specify)", value: "other" }
    ]
  },
  {
    category: "Local / Miscellaneous Permissions",
    options: [
      { label: "Local Authority Permission", value: "local_authority_permission" },
      { label: "No License Required", value: "no_license_required" },
      { label: "Other (Please specify)", value: "other" }
    ]
  }
];

/* ---------------- COMPONENT ---------------- */
const LicenseSelector = () => {
  const [cards, setCards] = useState([
    {
      id: Date.now(),
      selected: {},
      files: {},
      openSections: {},
      otherText: {} // { category: "text" }
    }
  ]);

  const toggleSection = (cardId, category) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              openSections: {
                ...c.openSections,
                [category]: !c.openSections[category]
              }
            }
          : c
      )
    );
  };

  const toggleOption = (cardId, category, value) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;

        const current = c.selected[category] || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];

        return {
          ...c,
          selected: { ...c.selected, [category]: updated }
        };
      })
    );
  };

  const pickPDF = async (cardId, licenseValue) => {
    try {
      const res = await pick({
        type: "application/pdf",
        allowMultiple: false
      });
      if (!res?.length) return;

      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, files: { ...c.files, [licenseValue]: res[0] } }
            : c
        )
      );
    } catch {}
  };

  const updateOtherText = (cardId, category, text) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              otherText: { ...c.otherText, [category]: text }
            }
          : c
      )
    );
  };

  const addCard = () => {
    setCards((p) => [
      ...p,
      {
        id: Date.now(),
        selected: {},
        files: {},
        openSections: {},
        otherText: {}
      }
    ]);
  };

  const deleteCard = (id) => {
    setCards((p) => p.filter((c) => c.id !== id));
  };

  const renderOption = (card, category, option) => {
    const isSelected = card.selected[category]?.includes(option.value);

    return (
      <View key={option.value} style={styles.optionRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => toggleOption(card.id, category, option.value)}
        >
          <View style={[styles.checkbox, isSelected && styles.checked]} />
          <Text>{option.label}</Text>
        </TouchableOpacity>

        {isSelected && option.value === "other" && (
          <TextInput
            placeholder="Enter other license"
            value={card.otherText[category] || ""}
            onChangeText={(t) => updateOtherText(card.id, category, t)}
            style={styles.otherInput}
          />
        )}

        {isSelected && option.value !== "no_license_required" && (
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => pickPDF(card.id, option.value)}
          >
            <Text style={styles.uploadText}>
              {card.files[option.value] ? "Change PDF" : "Upload PDF"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.question}>What licenses do you have?</Text>

      <FlatList
        data={cards}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>License {index + 1}</Text>
              {cards.length > 1 && (
                <TouchableOpacity onPress={() => deleteCard(item.id)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>

            {licenseOptions.map((s) => (
              <View key={s.category}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(item.id, s.category)}
                >
                  <Text style={styles.sectionTitle}>{s.category}</Text>
                  <Text>{item.openSections[s.category] ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {item.openSections[s.category] &&
                  s.options.map((o) => renderOption(item, s.category, o))}
              </View>
            ))}
          </View>
        )}
        scrollEnabled={false}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addCard}>
        <Text style={{ color: "#fff" }}>+ Add Another License</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LicenseSelector;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { padding: 16 },
  question: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontWeight: "600" },
  delete: { color: "#D32F2F" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  sectionTitle: { fontWeight: "600" },
  optionRow: { marginLeft: 8, marginBottom: 6 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    marginRight: 8
  },
  checked: { backgroundColor: "#EE6969" },
  uploadBtn: { marginLeft: 26, marginTop: 4 },
  uploadText: { color: "#EE6969" },
  otherInput: {
    marginLeft: 26,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8
  },
  addBtn: {
    backgroundColor: "#EE6969",
    padding: 14,
    alignItems: "center",
    borderRadius: 8
  }
});
