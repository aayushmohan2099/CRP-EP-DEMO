import React from 'react';

const GeneralForm = ({ form, setField, t, language }) => {
  return (
    <div className="general-form">
      <label>{t(language, 'enterprise_name')}</label>
      <input 
        type="text" 
        value={form.enterprise_name} 
        onChange={e => setField('enterprise_name', e.target.value)} 
      />

      <label>{t(language, 'enterprise_type')}</label>
      <select value={form.enterprise_type || ''} onChange={e => setField('enterprise_type', e.target.value)}>
        <option value="">Select</option>
        <option value="Production">{t(language, 'option_production')}</option>
        <option value="Service">{t(language, 'option_service')}</option>
        <option value="Trade">{t(language, 'option_trade')}</option>
        <option value="Others">{t(language, 'option_others')}</option>
      </select>
      {form.enterprise_type === 'Others' && (
        <input 
          type="text" 
          placeholder="Specify" 
          value={form.enterprise_type_other} 
          onChange={e => setField('enterprise_type_other', e.target.value)} 
        />
      )}

      <label>{t(language, 'ownership_type')}</label>
      <select value={form.ownership_type || ''} onChange={e => setField('ownership_type', e.target.value)}>
        <option value="">Select</option>
        <option value="Individual">{t(language, 'option_individual')}</option>
        <option value="Self-Help Group">{t(language, 'option_shg')}</option>
        <option value="Partnership">{t(language, 'option_partnership')}</option>
        <option value="Cooperative">{t(language, 'option_cooperative')}</option>
        <option value="FPO">{t(language, 'option_fpo')}</option>
        <option value="Others">{t(language, 'option_others')}</option>
      </select>
      {form.ownership_type === 'Others' && (
        <input 
          type="text" 
          placeholder="Specify" 
          value={form.ownership_type_other} 
          onChange={e => setField('ownership_type_other', e.target.value)} 
        />
      )}

      <label>{t(language, 'year_of_establishment')}</label>
      <input 
        type="number" 
        value={form.year_of_establishment} 
        onChange={e => setField('year_of_establishment', e.target.value)} 
      />
    </div>
  );
};

export default GeneralForm;
