import React from 'react';

const ProductionCapacityForm = ({ form, setField, t, language }) => {
  return (
    <div className="production-capacity-form">
      <label>{t(language, 'main_product_service')}</label>
      <input type="text" value={form.main_product_service} onChange={e => setField('main_product_service', e.target.value)} />

      <label>{t(language, 'raw_material')}</label>
      <input type="text" value={form.raw_material} onChange={e => setField('raw_material', e.target.value)} />

      <label>{t(language, 'machinery_equipment')}</label>
      <input type="text" value={form.machinery_equipment} onChange={e => setField('machinery_equipment', e.target.value)} />

      <label>{t(language, 'production_capacity')}</label>
      <input type="text" value={form.production_capacity} onChange={e => setField('production_capacity', e.target.value)} />

      <label>{t(language, 'packaging_branding_status')}</label>
      <input type="text" value={form.packaging_branding_status} onChange={e => setField('packaging_branding_status', e.target.value)} />

      <label>{t(language, 'certification_registration')}</label>
      <input type="text" value={form.certification_registration} onChange={e => setField('certification_registration', e.target.value)} />

      <label>{t(language, 'workplace_type')}</label>
      <select value={form.workplace_type || ''} onChange={e => setField('workplace_type', e.target.value)}>
        <option value="">Select</option>
        <option value="Home-based">{t(language, 'option_home')}</option>
        <option value="Rented">{t(language, 'option_rented')}</option>
        <option value="Own">{t(language, 'option_own')}</option>
        <option value="Others">{t(language, 'option_others')}</option>
      </select>
      {form.workplace_type === 'Others' && (
        <input type="text" placeholder="Specify" value={form.workplace_type_other} onChange={e => setField('workplace_type_other', e.target.value)} />
      )}

      <label>{t(language, 'electricity_available')}</label>
      <select value={form.electricity_available || ''} onChange={e => setField('electricity_available', e.target.value)}>
        <option value="">Select</option>
        <option value="Yes">{t(language, 'option_yes')}</option>
        <option value="No">{t(language, 'option_no')}</option>
      </select>

      <label>{t(language, 'water_available')}</label>
      <select value={form.water_available || ''} onChange={e => setField('water_available', e.target.value)}>
        <option value="">Select</option>
        <option value="Yes">{t(language, 'option_yes')}</option>
        <option value="No">{t(language, 'option_no')}</option>
      </select>

      <label>{t(language, 'transportation_facility')}</label>
      <select value={form.transportation_facility || ''} onChange={e => setField('transportation_facility', e.target.value)}>
        <option value="">Select</option>
        <option value="Yes">{t(language, 'option_yes')}</option>
        <option value="No">{t(language, 'option_no')}</option>
        <option value="Others">{t(language, 'option_need_help')}</option>
      </select>
      {form.transportation_facility === 'Others' && (
        <input type="text" placeholder="Specify" value={form.transportation_facility_other} onChange={e => setField('transportation_facility_other', e.target.value)} />
      )}
    </div>
  );
};

export default ProductionCapacityForm;
