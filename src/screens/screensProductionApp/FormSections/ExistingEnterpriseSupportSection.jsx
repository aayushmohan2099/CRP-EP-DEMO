// src/screens/screensProductionApp/FormSections/ExistingEnterpriseSupportSection.jsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const YES_NO_OPTIONS = [
  { label: 'Select...', value: '' },
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const OTHER_SUPPORT_TYPES = [
  { label: 'Select...', value: '' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Loan', value: 'Loan' },
  { label: 'Others', value: 'Others' },
];

const LOAN_AMOUNT_OPTIONS = [
  { label: '50,000 - 1,00,000', value: '50,000 - 1,00,000' },
  { label: '1,00,000 - 2,00,000', value: '1,00,000 - 2,00,000' },
  { label: '2,00,000 - 5,00,000', value: '2,00,000 - 5,00,000' },
];

const PROMO_OPTIONS = [
  { label: 'Select...', value: '' },
  { label: 'Physical', value: 'Physical' },
  { label: 'Online', value: 'Online' },
  { label: 'Others', value: 'Others' },
];

const INFRA_OPTIONS = [
  { label: 'Select...', value: '' },
  { label: 'Equipments', value: 'Equipments' },
  { label: 'Machinery', value: 'Machinery' },
  { label: 'Place of Business', value: 'Place of Business' },
  { label: 'Others', value: 'Others' },
];

/**
 * Props:
 *  - data: section slice of the master form, e.g.
 *      {
 *        other_support_type: '',
 *        other_support_spec: '',
 *        other_support_loan_amount_range: '',
 *        other_support: '',                      // final string to send to API (optional)
 *        mentorship_support: '',
 *        is_promo_ad_req: '',
 *        is_promo_ad_req_spec: '',
 *        infrastructure_support: '',
 *        infrastructure_support_spec: '',
 *        digital_emarket_support: '',
 *        machinery_equipment_support: '',
 *      }
 *  - onChange: (partialUpdateObj) => void  // merges into parent state
 *  - onNext?: () => void
 *  - onBack?: () => void
 */
const ExistingEnterpriseSupportSection = ({
  data = {},
  onChange = () => {},
  onNext,
  onBack,
}) => {
  const {
    other_support_type = '',
    other_support_spec = '',
    other_support_loan_amount_range = '',
    mentorship_support = '',
    is_promo_ad_req = '',
    is_promo_ad_req_spec = '',
    infrastructure_support = '',
    infrastructure_support_spec = '',
    digital_emarket_support = '',
    machinery_equipment_support = '',
  } = data;

  const update = (patch) => {
    onChange(patch);
  };

  // Compose a “dictionary-like” string for other_support when we have enough info
  const recalcOtherSupport = (type, spec, range) => {
    let composed = '';
    if (type === 'Loan' && range) {
      // {Loan: 50,000 - 1,00,000}
      composed = `{Loan: ${range}}`;
    } else if (type === 'Cash' && spec) {
      // {Cash: <spec text>}
      composed = `{Cash: ${spec}}`;
    } else if (type === 'Others' && spec) {
      // {Others: <spec text>}
      composed = `{Others: ${spec}}`;
    }

    update({
      other_support_type: type,
      other_support_spec: spec,
      other_support_loan_amount_range: range,
      other_support: composed,
    });
  };

  const handleOtherSupportTypeChange = (val) => {
    const nextType = val;
    let nextSpec = other_support_spec;
    let nextRange = other_support_loan_amount_range;

    // If switching away from Loan, clear loan range
    if (nextType !== 'Loan') {
      nextRange = '';
    }
    recalcOtherSupport(nextType, nextSpec, nextRange);
  };

  const handleOtherSupportSpecChange = (text) => {
    recalcOtherSupport(other_support_type, text, other_support_loan_amount_range);
  };

  const handleOtherSupportLoanRangeChange = (val) => {
    recalcOtherSupport(other_support_type, other_support_spec, val);
  };

  const renderYesNoPicker = (label, value, fieldKey, helpText) => (
    <View style={styles.fieldBlock} key={fieldKey}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.helpText}>{helpText}</Text>
      <Picker
        selectedValue={value}
        style={[styles.input, styles.dropdown]}
        onValueChange={(v) => update({ [fieldKey]: v })}
      >
        {YES_NO_OPTIONS.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Text style={styles.sectionTitle}>7) Support Required</Text>

      {/* 25) Is any financial support required? -> other_support (composed) */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          25) Is any financial support required? (अन्य वित्तीय सहायता की आवश्यकता है?)
        </Text>
        <Text style={styles.helpText}>
          Please choose the type of financial support you need. If you select Cash or
          Others, kindly specify in detail. If you select Loan, please choose the
          approximate amount range. Thank you.
        </Text>

        <Picker
          selectedValue={other_support_type}
          onValueChange={handleOtherSupportTypeChange}
          style={[styles.input, styles.dropdown]}
        >
          {OTHER_SUPPORT_TYPES.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>

        {(other_support_type === 'Cash' || other_support_type === 'Others') && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder={
              other_support_type === 'Cash'
                ? 'Please specify the cash support required.'
                : 'Please specify the other type of support required.'
            }
            value={other_support_spec}
            onChangeText={handleOtherSupportSpecChange}
            multiline
          />
        )}

        {other_support_type === 'Loan' && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>If Loan, what amount range is required?</Text>
            <Text style={styles.helpText}>
              Please select the loan amount range you require. This will help in planning
              suitable financial linkages.
            </Text>
            <Picker
              selectedValue={other_support_loan_amount_range}
              onValueChange={handleOtherSupportLoanRangeChange}
              style={[styles.input, styles.dropdown]}
            >
              <Picker.Item label="Select amount range..." value="" />
              {LOAN_AMOUNT_OPTIONS.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
        )}

        {/* Optional: small preview of what will be sent in other_support */}
        {data.other_support ? (
          <Text style={styles.previewText}>
            Will send as: {data.other_support}
          </Text>
        ) : null}
      </View>

      {/* 26) Mentorship support */}
      {renderYesNoPicker(
        '26) Do you require Mentorship support? (क्या आपको मार्गदर्शन/मेंटर्शिप सहायता की आवश्यकता है?)',
        mentorship_support,
        'mentorship_support',
        'Please select Yes if you would like regular guidance or mentorship for running or expanding your enterprise.'
      )}

      {/* 27) Branding / promotion support */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          27) What type of Branding Promotion Assistance do you require?
          (आपको किस प्रकार की ब्रांडिंग/प्रमोशन सहायता चाहिए?)
        </Text>
        <Text style={styles.helpText}>
          Please select how you would like support for promoting your enterprise. If you
          select any option, you may also briefly specify your exact requirement.
        </Text>

        <Picker
          selectedValue={is_promo_ad_req}
          onValueChange={(v) => {
            update({
              is_promo_ad_req: v,
              // If changing to blank, also clear spec
              ...(v === '' ? { is_promo_ad_req_spec: '' } : {}),
            });
          }}
          style={[styles.input, styles.dropdown]}
        >
          {PROMO_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>

        {is_promo_ad_req ? (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Please specify the type of branding/promotion assistance you require."
            value={is_promo_ad_req_spec}
            onChangeText={(text) => update({ is_promo_ad_req_spec: text })}
            multiline
          />
        ) : null}
      </View>

      {/* 28) Infrastructure support */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          28) What type of Infrastructure support do you require?
          (आपको किस प्रकार का आधारभूत संरचना सहयोग चाहिए?)
        </Text>
        <Text style={styles.helpText}>
          Please select the main type of infrastructure support you need. You may further
          describe your requirement in the text box.
        </Text>

        <Picker
          selectedValue={infrastructure_support}
          onValueChange={(v) => {
            update({
              infrastructure_support: v,
              ...(v === '' ? { infrastructure_support_spec: '' } : {}),
            });
          }}
          style={[styles.input, styles.dropdown]}
        >
          {INFRA_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>

        {infrastructure_support ? (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Please specify the exact infrastructure support you require."
            value={infrastructure_support_spec}
            onChangeText={(text) => update({ infrastructure_support_spec: text })}
            multiline
          />
        ) : null}
      </View>

      {/* 29) Digital e-market support */}
      {renderYesNoPicker(
        '29) Do you require Digital E-Market support? (क्या आपको डिजिटल ई-मार्केट सहायता चाहिए?)',
        digital_emarket_support,
        'digital_emarket_support',
        'Please select Yes if you want support in selling your products through digital / online platforms.'
      )}

      {/* 30) Machinery / equipment support */}
      {renderYesNoPicker(
        '30) Do you require Machinery / Equipment support? (क्या आपको मशीनरी/उपकरण सहायता चाहिए?)',
        machinery_equipment_support,
        'machinery_equipment_support',
        'Please select Yes if you need help in getting machinery or equipment for your enterprise.'
      )}

      {/* Navigation buttons (optional) */}
      <View style={styles.navRow}>
        {onBack && (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnSecondary]} onPress={onBack}>
            <Text style={styles.navBtnSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        {onNext && (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={onNext}>
            <Text style={styles.navBtnPrimaryText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  dropdown: {
    height: 44,
    justifyContent: 'center',
  },
  previewText: {
    marginTop: 6,
    fontSize: 11,
    color: '#999',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  navBtnPrimary: {
    backgroundColor: '#EE6969',
  },
  navBtnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  navBtnSecondary: {
    backgroundColor: '#eee',
  },
  navBtnSecondaryText: {
    color: '#333',
    fontWeight: '600',
  },
});

export default ExistingEnterpriseSupportSection;
