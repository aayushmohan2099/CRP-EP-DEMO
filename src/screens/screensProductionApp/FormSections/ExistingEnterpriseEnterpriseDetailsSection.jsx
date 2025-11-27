// src/screens/screensProductionApp/FormSections/ExistingEnterpriseEnterpriseDetailsSection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const WORKPLACE_TYPE_OPTIONS = [
  'Home-based workplace',
  'Rented shop / workplace',
  'Owned shop / workplace',
  'Mobile / street-based unit',
  'Shared workplace',
  'Others',
];

const ELECTRICITY_OPTIONS = [
  'Regular',
  'Partial / Irregular',
  'Solarized',
  'No',
  'Others',
];

const WATER_OPTIONS = [
  'Regular',
  'Limited',
  'No',
  'Others',
];

const TRANSPORT_AVAILABILITY_OPTIONS = [
  'Regular transport available',
  'Sometimes available',
  'Very limited transport',
  'No transport',
  'Need Help',
];

const BIJNOR_OPTIONS = [
  'Yes',
  'No',
];

export default function ExistingEnterpriseEnterpriseDetailsSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);

  const showNeedTransportHelp =
    existingForm.transportation_availability === 'Need Help';

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>3) Enterprise Details Section</Text>

      {/* 9) Workplace Type */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>9) What is your Workplace Type?</Text>
        <Text style={styles.helpText}>
          Please select the option that best describes where you run your
          enterprise from. If it does not match, please choose Others and
          specify.
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.workplace_type || ''}
            onValueChange={(v) => update({ workplace_type: v })}
          >
            <Picker.Item label="Select..." value="" />
            {WORKPLACE_TYPE_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
        {existingForm.workplace_type === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Please specify your workplace type"
            value={existingForm.workplace_type_other || ''}
            onChangeText={(v) => update({ workplace_type_other: v })}
          />
        )}
      </View>

      {/* 10) Electricity Availability */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>10) Electricity Availability</Text>
        <Text style={styles.helpText}>
          Please select the option that best describes the electricity
          situation at your workplace. If your case is different, kindly
          choose Others and describe it.
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.electricity_available || ''}
            onValueChange={(v) => update({ electricity_available: v })}
          >
            <Picker.Item label="Select..." value="" />
            {ELECTRICITY_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
        {existingForm.electricity_available === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Please specify your electricity situation"
            value={existingForm.electricity_other || ''}
            onChangeText={(v) => update({ electricity_other: v })}
          />
        )}

        <TextInput
          style={[styles.input, { marginTop: 6 }]}
          placeholder="You may add more details here (optional)"
          value={existingForm.electricity_detail || ''}
          onChangeText={(v) => update({ electricity_detail: v })}
        />
      </View>

      {/* 11) Water Availability */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>11) Water Availability</Text>
        <Text style={styles.helpText}>
          Please select how easily water is available for your enterprise
          activities. If the situation is different, please select Others and
          give details.
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.water_available || ''}
            onValueChange={(v) => update({ water_available: v })}
          >
            <Picker.Item label="Select..." value="" />
            {WATER_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
        {existingForm.water_available === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Please specify your water availability"
            value={existingForm.water_other || ''}
            onChangeText={(v) => update({ water_other: v })}
          />
        )}

        <TextInput
          style={[styles.input, { marginTop: 6 }]}
          placeholder="You may add more details here (optional)"
          value={existingForm.water_detail || ''}
          onChangeText={(v) => update({ water_detail: v })}
        />
      </View>

      {/* Transport Availability */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          12) What is the Transport Availability for your Enterprise?
        </Text>
        <Text style={styles.helpText}>
          Please select how easily you get transport (like tempo, bus, pickup,
          etc.) to bring raw material and send products. If you face serious
          difficulty, kindly choose Need Help.
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.transportation_availability || ''}
            onValueChange={(v) => update({ transportation_availability: v })}
          >
            <Picker.Item label="Select..." value="" />
            {TRANSPORT_AVAILABILITY_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        {showNeedTransportHelp && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.helpText}>
              Please describe what kind of transport support you need (for
              example, vehicle support, better road, regular pickup, etc.).
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={existingForm.need_transport_help || ''}
              onChangeText={(v) => update({ need_transport_help: v })}
            />
          </View>
        )}
      </View>

      {/* Can send products to Bijnor */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          13) Can you send your products to Bijnor or nearby big markets?
        </Text>
        <Text style={styles.helpText}>
          Please select if you are able to send your products to Bijnor or
          similar bigger markets. This helps us understand your market reach.
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.can_send_to_bijnor || ''}
            onValueChange={(v) => update({ can_send_to_bijnor: v })}
          >
            <Picker.Item label="Select..." value="" />
            {BIJNOR_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
});
