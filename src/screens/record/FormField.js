// src/constants/formFields.js

// IMPORTANT: Ensure these field names EXACTLY match your Google Sheet headers (case-sensitive)
// Add any new fields from your forms here.

export const EXISTING_ENTERPRISE_ALL_FIELDS = [
  'enterprise_name',
  'enterprise_type',
  'enterprise_type_other', // For "Others" specify
  'ownership_type',
  'ownership_type_other', // For "Others" specify
  'year_of_establishment',
  'raw_material',
  'raw_material_other', // For "Others" specify
  'machinery_equipment',
  'machinery_equipment_other', // For "Others" specify
  'workplace_type',
  'workplace_type_other', // For "Others" specify
  'electricity_available',
  'electricity_more_detail', // For "Partial / Irregular" or "Others"
  'electricity_specify',     // For "Others" specify
  'water_available',
  'water_more_detail',       // For "Limited" or "Others"
  'water_specify',           // For "Others" specify
  'transportation_facility',
  'can_transport_clf',       // For "Can you transport..." question
  'initial_investment',
  'source_of_investment',
  'source_of_investment_specify', // For "Others" specify
  'government_subsidy',
  'subsidy_department',      // For "Yes" on government_subsidy
  'subsidy_scheme',          // For "Yes" on government_subsidy
  'loan_details',            // Stored as JSON string or "No"
  'working_capital_monthly',
  'annual_turnover',
  'profit_percentage',
  'main_product_service',
  'main_product_service_other', // For "Others" specify
  'product_features',
  'production_capacity',
  'packaging_branding_status',
  'certification_registration', // Yes/No
  'target_customers',
  'marketing_channels',       // Stored as comma-separated string (e.g., "Retail,Online")
  'marketing_channels_other_specify', // For "Others" specify
  'monthly_sales',
  'marketing_strategy',
  'marketing_challenges',
  'training_received',
  'skills_acquired',
  'future_training_requirements', // Yes/No. This is the main question.
  'additional_training_required', // The actual Yes/No value for the future training question
  'training_skill_name',          // Conditional fields for future training
  'training_type',
  'training_institution',
  'institutional_support',
  'institutional_support_other', // For "Others" specify
  'financial_linkage',
  'financial_linkage_other', // For "Others" specify
  'financial_coordination',
  'market_linkage',           // Stored as comma-separated string
  'market_linkage_other',     // For "Others" specify
  'mentorship_support',
  'expansion_plan',           // Stored as comma-separated string
  'expansion_plan_other',     // For "Others" specify
  'required_support',         // Stored as comma-separated string
  'required_support_other',   // For "Others" specify
  'photo_enterprise',         // URL
  'photo_entrepreneur',       // URL
  'photo_product',            // URL
  'certificate_docs',         // Comma-separated URLs
];

export const NEW_ENTERPRISE_ALL_FIELDS = [
  'interested_business',
  'has_arranged_place',
  'arranged_place_address',
  'is_trained',
  'training_details',
  'skill_training_support',
  'entre_dev_training_support',
  'credit_linkage_support',
  'market_linkage_support',
  'machinery_support',
  'worksite_support',
  'digital_support',
  'other_support',
];

// Fields that should be stored as comma-separated strings in the backend
export const MULTI_SELECT_FIELDS = [
    'marketing_channels',
    'required_support',
    'expansion_plan',
    'market_linkage',
];

// Fields that are stored as JSON strings
export const JSON_STRING_FIELDS = [
    'loan_details',
];