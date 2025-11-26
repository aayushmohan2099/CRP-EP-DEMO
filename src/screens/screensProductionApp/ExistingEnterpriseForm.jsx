// src/screens/epsakhi/ExistingEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import gsApi from '../../api/gsApi';
import { getUser } from '../../utils/auth';

// Section components
import ExistingEnterpriseBasicInfoSection from './FormSections/ExistingEnterpriseBasicInfoSection';
import ExistingEnterpriseProductServicesSection from './FormSections/ExistingEnterpriseProductServicesSection';
import ExistingEnterpriseEnterpriseDetailsSection from './FormSections/ExistingEnterpriseEnterpriseDetailsSection';
import ExistingEnterpriseInvestmentSection from './FormSections/ExistingEnterpriseInvestmentSection';
import ExistingEnterpriseLoanSubsidySection from './FormSections/ExistingEnterpriseLoanSubsidySection';
import ExistingEnterpriseTrainingSkillsSection from './FormSections/ExistingEnterpriseTrainingSkillsSection';
import ExistingEnterpriseSupportSection from './FormSections/ExistingEnterpriseSupportSection';
import ExistingEnterpriseMediaSection from './FormSections/ExistingEnterpriseMediaSection';
import ExistingEnterpriseDeclarationSection from './FormSections/ExistingEnterpriseDeclarationSection';

export default function ExistingEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null;
  const existingEnterprise = route?.params?.existingEnterprise || null;

  // --- master form state (single source of truth) ---
  const [existingForm, setExistingForm] = useState({
    // BASIC
    enterprise_name: '',
    ownership_type: '',
    ownership_type_other: '',
    owner_special_category: '',
    year_of_establishment: '',
    uddyam_aadhar: '',
    total_emp: '',
    number_of_shg_emp: '',
    // enterprise-type (collected in child table)
    enterprise_types_tree: [], // [{ parent, children: [] }]

    // PRODUCT + SERVICES (child table + some main fields)
    products: [], // [{ main_product_name, activity_or_product_type, ... }]

    // ENTERPRISE DETAILS
    workplace_type: '',
    workplace_type_other: '',
    electricity_available: '',
    electricity_detail: '',
    electricity_other: '',
    water_available: '',
    water_detail: '',
    water_other: '',
    transportation_availability: '',
    can_send_to_bijnor: '',
    need_transport_help: '',

    // INVESTMENT
    monthly_income_estimate: '',
    annual_turnover: '',
    gross_profit: '',
    working_capital_monthly: '',
    has_shg_cif: '',
    cif_fund_amt: '',
    initial_investment: '',
    source_of_investment_tree: [], // [{ parent, children: [] }]

    // LOAN / SUBSIDY SECTION (child tables)
    has_taken_loan: '',
    loans: [], // [{ institution_tree, loan_amount, date_taken, repayment_status }]
    has_receieved_subsidy: '',
    subsidies: [], // [{ subsidy_type, subsidy_name_tree, subsidy_detail }]

    // TRAINING RECEIVED / REQUIRED (child table)
    is_training_received: '',
    training_received_rows: [], // [{ department, sector_tree, certificates_files }]
    is_training_required: '',
    training_required_rows: [], // [{ department, sector_tree, duration, location, expected_income }]
    nearest_skill_centre: '',
    skill_centre_loc: '',
    nearest_industry: '',
    industry_loc: '',

    // SUPPORT REQUIRED
    other_support: '',
    other_support_specify: '',
    other_support_loan_amount: '',
    mentorship_support: '',
    is_promo_ad_req: '',
    promo_ad_specify: '',
    infrastructure_support: '',
    infrastructure_support_specify: '',
    digital_emarket_support: '',
    machinery_equipment_support: '',

    // MEDIA (child table)
    media: {
      photo_entrepreneur: [],
      photo_enterprise: [],
      declaration_signature: [],
      // these 3 are per-product handled via products[*].media
    },

    // DECLARATION
    declaration_confirmed: '',
    declaration_date: '',
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load logged user + set auth token
  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) {
            gsApi.setAuthToken?.(u.access, u.refresh);
          }
        }
      } catch (e) {
        console.warn('Unable to load user', e);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // If editing, prefill some fields from existingEnterprise
  useEffect(() => {
    if (!existingEnterprise) return;
    setExistingForm((prev) => ({
      ...prev,
      enterprise_name: existingEnterprise.enterprise_name || '',
      ownership_type: existingEnterprise.ownership_type || '',
      year_of_establishment: existingEnterprise.year_of_establishment || '',
      uddyam_aadhar: existingEnterprise.uddyam_aadhar || '',
      total_emp: existingEnterprise.total_emp || '',
      number_of_shg_emp: existingEnterprise.number_of_shg_emp || '',
      workplace_type: existingEnterprise.workplace_type || '',
      electricity_available: existingEnterprise.electricity_available || '',
      water_available: existingEnterprise.water_available || '',
      transportation_availability:
        existingEnterprise.transportation_availability || '',
      can_send_to_bijnor: existingEnterprise.can_send_to_bijnor || '',
      monthly_income_estimate:
        existingEnterprise.monthly_income_estimate || '',
      annual_turnover: existingEnterprise.annual_turnover || '',
      gross_profit: existingEnterprise.gross_profit || '',
      working_capital_monthly:
        existingEnterprise.working_capital_monthly || '',
      initial_investment: existingEnterprise.initial_investment || '',
      declaration_confirmed:
        existingEnterprise.declaration_confirmed || '',
      declaration_date: existingEnterprise.declaration_date || '',
    }));
  }, [existingEnterprise]);

  const updateForm = (patch) => {
    setExistingForm((prev) => ({ ...prev, ...patch }));
  };

  // Helpers to strip out child tables from main payload.
  // Now explicitly inject recorded_beneficiary here.
  const buildMainPayload = (recordedBenefId) => {
    const {
      enterprise_types_tree,
      products,
      source_of_investment_tree,
      loans,
      subsidies,
      training_received_rows,
      training_required_rows,
      media,
      ...rest
    } = existingForm;

    const payload = {
      ...rest,
      // FIRST: link to recorded beneficiary row
      recorded_beneficiary: recordedBenefId || null,
    };

    return {
      payload,
      enterpriseTypesTree: enterprise_types_tree || [],
      products: products || [],
      sourceOfInvestmentTree: source_of_investment_tree || [],
      loans: loans || [],
      subsidies: subsidies || [],
      trainingReceivedRows: training_received_rows || [],
      trainingRequiredRows: training_required_rows || [],
      media,
    };
  };

  const saveEnterpriseTypes = async (enterpriseId, tree) => {
    if (!Array.isArray(tree)) return;
    for (const row of tree) {
      if (!row.parent || !Array.isArray(row.children) || row.children.length === 0)
        continue;

      // Dictionary-style sub_category text per parent:
      // [Parent: child1, child2]
      const subCategoryText = `[${row.parent}: ${row.children.join(', ')}]`;

      await gsApi.createEnterpriseType({
        enterprise: enterpriseId,
        form_type: 'exep',
        parent_category: row.parent,
        sub_category: subCategoryText,
      });
    }
  };

  const saveProductsAndMedia = async (enterpriseId, products) => {
    if (!Array.isArray(products)) return;
    for (const product of products) {
      const {
        media,
        main_product_name,
        activity_or_product_type,
        product_features,
        production_capacity,
        raw_material,
        machinery_equipment,
        target_customers,
        sales_area,
        packaging_branding_status,
        marketing_strategy,
        marketing_channels,
        marketing_challenges,
        market_linkage,
        accept_digital_payment,
        avg_monthly_sales,
      } = product;

      const prodRes = await gsApi.createEnterpriseProduct({
        enterprise: enterpriseId,
        form_type: 'exep',
        main_product_name,
        activity_or_product_type,
        product_features,
        production_capacity,
        raw_material,
        machinery_equipment,
        target_customers,
        sales_area,
        packaging_branding_status,
        marketing_strategy,
        marketing_channels: Array.isArray(marketing_channels)
          ? marketing_channels.join(', ')
          : marketing_channels || '',
        marketing_challenges: Array.isArray(marketing_challenges)
          ? marketing_challenges.join(', ')
          : marketing_challenges || '',
        market_linkage: Array.isArray(market_linkage)
          ? market_linkage.join(', ')
          : market_linkage || '',
        accept_digital_payment,
        avg_monthly_sales,
      });

      const productEnterpriseId = prodRes?.enterprise || enterpriseId;

      // media per product
      if (media) {
        const uploadGroup = async (fieldName, assets) => {
          if (!Array.isArray(assets) || assets.length === 0) return;
          for (const asset of assets) {
            if (!asset?.uri) continue;
            const formData = new FormData();
            formData.append('enterprise', String(productEnterpriseId));
            formData.append('form_type', 'exep');
            formData.append(fieldName, {
              uri: asset.uri,
              name: asset.fileName || 'photo.jpg',
              type: asset.type || 'image/jpeg',
            });
            await gsApi.uploadEnterpriseMedia(formData);
          }
        };
        await uploadGroup('open_box_photo', media.open_box || []);
        await uploadGroup('close_box_photo', media.close_box || []);
        await uploadGroup('others', media.others || []);
      }
    }
  };

  const saveInvestmentSources = async (enterpriseId, tree) => {
    // dictionary-style string for each parent
    if (!Array.isArray(tree)) return;
    for (const row of tree) {
      if (!row.parent || !row.children || row.children.length === 0) continue;

      const mapped = `[${row.parent}: ${row.children.join(', ')}]`;

      await gsApi.createEnterpriseSupportDetail({
        enterprise: enterpriseId,
        form_type: 'exep',
        subsidy_type: 'Investment Source',
        subsidy_name: mapped,
        subsidy_detail: '',
      });
    }
  };

  const saveLoans = async (enterpriseId, loans) => {
    if (!Array.isArray(loans)) return;
    for (const loan of loans) {
      const { institution_tree, loan_amount, date_taken, repayment_status } = loan;
      let institutionText = '';
      if (Array.isArray(institution_tree) && institution_tree.length > 0) {
        institutionText = institution_tree
          .map(
            (row) =>
              `[${row.parent}: ${(row.children || []).join(', ')}]`
          )
          .join(', ');
      }
      await gsApi.createEnterpriseLoanDetail({
        enterprise: enterpriseId,
        form_type: 'exep',
        institution_name: institutionText,
        loan_amount,
        date_taken,
        repayment_status,
      });
    }
  };

  const saveSubsidies = async (enterpriseId, subsidies) => {
    if (!Array.isArray(subsidies)) return;
    for (const sub of subsidies) {
      const { subsidy_type, subsidy_name_tree, subsidy_detail } = sub;
      let subsidyName = '';
      if (Array.isArray(subsidy_name_tree) && subsidy_name_tree.length > 0) {
        subsidyName = subsidy_name_tree
          .map(
            (row) =>
              `[${row.parent}: ${(row.children || []).join(', ')}]`
          )
          .join(', ');
      }
      await gsApi.createEnterpriseSupportDetail({
        enterprise: enterpriseId,
        form_type: 'exep',
        subsidy_type,
        subsidy_name: subsidyName,
        subsidy_detail,
      });
    }
  };

  const saveTrainingReqs = async (enterpriseId, rows, formType) => {
    if (!Array.isArray(rows)) return;
    for (const r of rows) {
      const { department, sector_tree, duration, location, expected_income } = r;
      let trainingModuleText = '';
      if (Array.isArray(sector_tree) && sector_tree.length > 0) {
        trainingModuleText = sector_tree
          .map(
            (row) =>
              `[${row.parent}: ${(row.children || []).join(', ')}]`
          )
          .join(', ');
      }
      await gsApi.createEnterpriseTrainingReq({
        enterprise: enterpriseId,
        form_type: formType, // 'rec' or 'req'
        department,
        sector: (sector_tree || []).map((row) => row.parent).join(', '),
        training_module_name: trainingModuleText,
        duration: duration || '',
        location: location || '',
        expected_income: expected_income || '',
      });
    }
  };

  const saveStandaloneMedia = async (enterpriseId, media) => {
    if (!media) return;
    const upload = async (fieldName, assets) => {
      if (!Array.isArray(assets) || assets.length === 0) return;
      for (const asset of assets) {
        if (!asset?.uri) continue;
        const formData = new FormData();
        formData.append('enterprise', String(enterpriseId));
        formData.append('form_type', 'exep');
        formData.append(fieldName, {
          uri: asset.uri,
          name: asset.fileName || 'file.jpg',
          type: asset.type || 'image/jpeg',
        });
        await gsApi.uploadEnterpriseMedia(formData);
      }
    };

    await upload('photo_entrepreneur', media.photo_entrepreneur || []);
    await upload('photo_enterprise', media.photo_enterprise || []);
    await upload('others', media.declaration_signature || []);
  };

  const handleSubmit = async () => {
    // 1) Resolve recorded beneficiary row (must exist; created earlier from SHG member cache)
    const recordedBenefId =
      recordedBenef?.id || existingEnterprise?.recorded_beneficiary || null;

    if (!recordedBenefId) {
      Alert.alert(
        'Missing Beneficiary',
        'Beneficiary information is missing. Please open this form from a beneficiary context again.'
      );
      return;
    }

    // 2) Build payload (injecting recorded_beneficiary)
    const {
      payload,
      enterpriseTypesTree,
      products,
      sourceOfInvestmentTree,
      loans,
      subsidies,
      trainingReceivedRows,
      trainingRequiredRows,
      media,
    } = buildMainPayload(recordedBenefId);

    // basic validation
    if (!payload.enterprise_name) {
      Alert.alert('Missing information', 'Please fill the Enterprise Name.');
      return;
    }

    if (!payload.declaration_confirmed || payload.declaration_confirmed !== 'Yes') {
      Alert.alert(
        'Declaration required',
        'Please confirm the declaration before submitting.'
      );
      return;
    }

    setSubmitting(true);
    try {
      let enterpriseRes;
      if (existingEnterprise?.id) {
        enterpriseRes = await gsApi.updateExistingEnterprise(
          existingEnterprise.id,
          payload
        );
      } else {
        enterpriseRes = await gsApi.createExistingEnterprise(payload);
      }
      const enterpriseId = enterpriseRes.id || existingEnterprise?.id;
      if (!enterpriseId) {
        throw new Error('Enterprise ID not returned from API');
      }

      // 3) Link recorded beneficiary with this enterprise + enterprise_type = "exep"
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise: enterpriseId,
          enterprise_type: 'exep',
        });
      } catch (e) {
        console.warn('Failed to link recorded beneficiary with enterprise', e);
      }

      // 4) child tables (best-effort, don't hard-fail on individual errors)
      try {
        await saveEnterpriseTypes(enterpriseId, enterpriseTypesTree);
      } catch (e) {
        console.warn('Failed to save enterprise types', e);
      }
      try {
        await saveProductsAndMedia(enterpriseId, products);
      } catch (e) {
        console.warn('Failed to save products/media', e);
      }
      try {
        await saveInvestmentSources(enterpriseId, sourceOfInvestmentTree);
      } catch (e) {
        console.warn('Failed to save investment sources', e);
      }
      try {
        await saveLoans(enterpriseId, loans);
      } catch (e) {
        console.warn('Failed to save loans', e);
      }
      try {
        await saveSubsidies(enterpriseId, subsidies);
      } catch (e) {
        console.warn('Failed to save subsidies', e);
      }
      try {
        await saveTrainingReqs(enterpriseId, trainingReceivedRows, 'rec');
        await saveTrainingReqs(enterpriseId, trainingRequiredRows, 'req');
      } catch (e) {
        console.warn('Failed to save training reqs', e);
      }
      try {
        await saveStandaloneMedia(enterpriseId, media);
      } catch (e) {
        console.warn('Failed to upload standalone media', e);
      }

      Alert.alert(
        'Saved',
        'Existing Enterprise form submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation?.goBack?.();
            },
          },
        ]
      );
    } catch (err) {
      console.error('ExistingEnterprise submit error', err);
      Alert.alert('Error', 'Unable to submit the form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <ExistingEnterpriseBasicInfoSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseProductServicesSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseEnterpriseDetailsSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseInvestmentSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseLoanSubsidySection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseTrainingSkillsSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseSupportSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseMediaSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />
      <ExistingEnterpriseDeclarationSection
        existingForm={existingForm}
        setExistingForm={updateForm}
      />

      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
        disabled={submitting}
        onPress={handleSubmit}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Form</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#fff' },
  submitBtn: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: '#EE6969',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
