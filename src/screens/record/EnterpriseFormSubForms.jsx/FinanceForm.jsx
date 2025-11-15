import React from 'react';

const FinanceForm = ({ form, setField, t, language }) => {
  return (
    <div className="finance-form">
      <label>{t(language, 'initial_investment')}</label>
      <input type="number" value={form.initial_investment} onChange={e => setField('initial_investment', e.target.value)} />

      <label>{t(language, 'working_capital_monthly')}</label>
      <input type="number" value={form.working_capital_monthly} onChange={e => setField('working_capital_monthly', e.target.value)} />

      <label>{t(language, 'annual_turnover')}</label>
      <input type="number" value={form.annual_turnover} onChange={e => setField('annual_turnover', e.target.value)} />

      <label>{t(language, 'profit_percentage')}</label>
      <input type="number" value={form.profit_percentage} onChange={e => setField('profit_percentage', e.target.value)} />

      <label>{t(language, 'source_of_investment')}</label>
      <select value={form.source_of_investment || ''} onChange={e => setField('source_of_investment', e.target.value)}>
        <option value="">Select</option>
        <option value="CCL">{t(language, 'option_ccl')}</option>
        <option value="CIF">{t(language, 'option_cif')}</option>
        <option value="Livelihood Fund">{t(language, 'option_livelihood')}</option>
        <option value="CEF">{t(language, 'option_cef')}</option>
        <option value="Others">{t(language, 'option_others')}</option>
      </select>
      {form.source_of_investment === 'Others' && (
        <input type="text" placeholder="Specify" value={form.source_of_investment_other} onChange={e => setField('source_of_investment_other', e.target.value)} />
      )}

      <label>{t(language, 'loan_institution')}</label>
      <input type="text" value={form.loan_institution} onChange={e => setField('loan_institution', e.target.value)} />

      <label>{t(language, 'loan_amount')}</label>
      <input type="number" value={form.loan_amount} onChange={e => setField('loan_amount', e.target.value)} />

      <label>{t(language, 'loan_repayment_status')}</label>
      <input type="text" value={form.loan_repayment_status} onChange={e => setField('loan_repayment_status', e.target.value)} />
    </div>
  );
};

export default FinanceForm;
