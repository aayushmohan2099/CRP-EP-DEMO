// src/screens/screensProductionApp/FormSections/ExistingEnterpriseInvestmentSection.jsx
import React, { useState } from 'react'; // <-- Added useState
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
const YES_NO = ['Yes', 'No'];

/**
 * Parent–child multi-select tree for "Source of Investment"
 * Values stored in existingForm.source_of_investment_tree
 */
const INVESTMENT_SOURCE_TREE = [
  {
    parent: 'MSME / Industry Department',
    children: [
      'UP MSME Promotion Policy 2022',
      'ODOP (One District One Product)',
      'Vishwakarma Shram Samman Yojana',
      'Chief Minister Youth Entrepreneur Development Campaign',
      'Micro-food Industries Promotion',
      'Capital Subsidy Scheme',
    ],
  },
  {
    parent: 'Women Welfare / Women Empowerment Department',
    children: ['Mahila Samarthya Yojana'],
  },
  {
    parent: 'Village Industries / Khadi and Village Industries Department',
    children: [
      'Khadi & Village Industries (KVIC UP) Loan Assistance',
      'Margin Money Scheme',
    ],
  },
  {
    parent: 'Agriculture / Animal Husbandry Department',
    children: [
      'Kamdhenu Dairy Yojana',
      'UP Food Processing Industry Support',
    ],
  },
  {
    parent: 'Department of Social Welfare',
    children: ['PM AJAY'],
  },
  {
    parent: 'Department of Fisheries',
    children: ['Chief Minister Matsya Sampada Yojana'],
  },
  {
    parent: 'OBC Finance Development Corporation',
    children: ['Self-employment loans'],
  },
  {
    parent: 'NABARD Schemes for SHGs & Rural Enterprises',
    children: [
      'Micro Enterprise Development Programme (MEDP)',
      'Livelihood Enterprise Development Programme (LEDP)',
      'Grant for capability building',
      'Loan refinancing',
    ],
  },
  {
    parent: 'Central Government Schemes (Also including NABARD)',
    children: [
      'Micro Enterprise Development Programme (MEDP)',
      'Livelihood Enterprise Development Programme (LEDP)',
      'Grant for capability building',
      'Loan refinancing',
    ],
  },
  {
    parent: 'Other Schemes',
    children: [
      'Mudra Loan (for women entrepreneurs)',
      'Stand-Up India (women SC/ST entrepreneurs)',
      'ZED (Zero Defect Zero Effect) – Women MSME',
      'Women Entrepreneurship Fund / Scheme',
      'Coir Vikas Yojana',
      'Prime Minister Employment Generation Programme (PMEGP)',
      'PM SVANidhi',
      'SHG-Bank Linkage',
      'PM-FME (PM Formalization of Micro Food Processing Enterprises)',
      'Dairy Entrepreneur Development Scheme',
      'Prime Minister Matsya Sampada Yojana',
      'PMFME (Micro Food Processing)',
      'SFURTI (Scheme of Fund for Regeneration of Traditional Industries)',
      'ASPIRE (A Scheme for Promotion of Innovation, Rural Industry and Entrepreneurship)',
      'AGEY',
      'SVEP',
      'PMFME',
      'PATB',
    ],
  },
  {
    parent: 'Others (Specify)',
    children: ['Others'],
  },
];

const SourceOfInvestmentTree = ({ value, onChange }) => {
  const selectedTree = Array.isArray(value) ? value : [];
  const [othersText, setOthersText] = useState(''); // <-- Added state for "Others"

  const isParentSelected = (parent) =>
    !!selectedTree.find((row) => row.parent === parent);

  const isChildSelected = (parent, child) => {
    const row = selectedTree.find((r) => r.parent === parent);
    return !!row && row.children?.includes(child);
  };

  const toggleParent = (parent) => {
    const exists = selectedTree.find((row) => row.parent === parent);
    let updated;
    if (exists) {
      updated = selectedTree.filter((row) => row.parent !== parent);
    } else {
      updated = [...selectedTree, { parent, children: [] }];
    }
    onChange(updated);
  };

  const toggleChild = (parent, child) => {
    const existing = selectedTree.find((row) => row.parent === parent);
    let updated = [...selectedTree];
    if (!existing) {
      updated.push({ parent, children: [child] });
    } else {
      const children = existing.children || [];
      const has = children.includes(child);
      const newChildren = has
        ? children.filter((c) => c !== child)
        : [...children, child];
      updated = updated.map((row) =>
        row.parent === parent ? { ...row, children: newChildren } : row
      );
    }
    onChange(updated);
  };

  return (
    <View style={{ marginTop: 8 }}>
      {INVESTMENT_SOURCE_TREE.map((group) => {
        const parentSelected = isParentSelected(group.parent);
        const isOthersGroup = group.parent === 'Others (Specify)';
        const isOthersSelected =
          isOthersGroup &&
          parentSelected &&
          isChildSelected(group.parent, 'Others'); // <-- check if Others is selected

        return (
          <View key={group.parent} style={styles.treeGroup}>
            <TouchableOpacity
              onPress={() => toggleParent(group.parent)}
              style={styles.treeParentRow}
            >
              <Text style={styles.treeParentText}>{group.parent}</Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {parentSelected && (
              <View style={styles.treeChildrenBlock}>
                {group.children.map((child) => (
                  <TouchableOpacity
                    key={child}
                    style={styles.treeChildRow}
                    onPress={() => toggleChild(group.parent, child)}
                  >
                    <Text style={styles.treeChildCheckbox}>
                      {isChildSelected(group.parent, child) ? '☑' : '☐'}
                    </Text>
                    <Text style={styles.treeChildLabel}>{child}</Text>
                  </TouchableOpacity>
                ))}

                {/* <-- TextInput only visible when Others is selected */}
                {isOthersSelected && (
                  <TextInput
                    style={[styles.input, { marginTop: 6 }]}
                    placeholder="Specify"
                    value={othersText}
                    onChangeText={(txt) => {
                      setOthersText(txt);
                      onChange(
                        selectedTree.map((row) =>
                          row.parent === group.parent
                            ? { ...row, others_specify: txt }
                            : row
                        )
                      );
                    }}
                  />
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const YesNoToggle = ({ value, onChange }) => (
  <View style={styles.yesNoRow}>
    {YES_NO.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.yesNoBtn, value === opt && styles.yesNoBtnActive]}
        onPress={() => onChange(opt)}
      >
        <Text
          style={[styles.yesNoText, value === opt && styles.yesNoTextActive]}
        >
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
// const calculateAndStoreGP = (incomeValue, workingCapitalValue) => {
//   const monthlyIncome = parseFloat(incomeValue) || 0;
//   const workingCapital = parseFloat(workingCapitalValue) || 0;

//   const monthlyGP = monthlyIncome - workingCapital;
//   const yearlyIncome = monthlyIncome * 12;
//   const yearlyWorkingCapital = workingCapital * 12;
//   const yearlyGP = yearlyIncome - yearlyWorkingCapital;

//   return {
//     monthlyIncome,
//     workingCapital,
//     monthlyGP,
//     yearlyGP,
//   };
// };

export default function ExistingEnterpriseInvestmentSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch); 
  const hasShgCifYes = existingForm.has_shg_cif === 'Yes';

// useEffect(() => {
//   const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
//   const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;

//   const monthlyGP = monthlyIncome - workingCapital;
//   const yearlyIncome = monthlyIncome * 12;
//   const yearlyWorkingCapital = workingCapital * 12;
  // const yearlyGP = yearlyIncome - yearlyWorkingCapital;

  // Store as numbers rounded to 2 decimals
//   setExistingForm(prev => ({
//     ...prev,
//     monthly_gp: Math.round(monthlyGP * 100) / 100,
//     monthly_income_numeric: Math.round(monthlyIncome * 100) / 100,
//     working_capital_numeric: Math.round(workingCapital * 100) / 100,
//   }));
// }, [existingForm.monthly_income_estimate, existingForm.working_capital_monthly]);

  // useEffect(() => {
  //   const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
  //   const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;

  //   const monthlyGP = monthlyIncome - workingCapital;
  //   const yearlyIncome = monthlyIncome * 12;
  //   const yearlyWorkingCapital = workingCapital * 12;
  //   const yearlyGP = yearlyIncome - yearlyWorkingCapital;

  //   const monthlyGPPercent = monthlyIncome > 0 ? ((monthlyGP / monthlyIncome) * 100).toFixed(2) : '0';
  //   const yearlyGPPercent = yearlyIncome > 0 ? ((yearlyGP / yearlyIncome) * 100).toFixed(2) : '0';

  //   // Store numeric values and percentages in existingForm
  //   update({
  //     monthly_gp: monthlyGP,
  //     monthly_gp_percent: monthlyGPPercent,
  //     yearly_gp: yearlyGP,
  //     yearly_gp_percent: yearlyGPPercent,
  //   });
  // }, [existingForm.monthly_income_estimate, existingForm.working_capital_monthly]);


  useEffect(() => {
    const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
    const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;

    const grossProfit = monthlyIncome - workingCapital;
    const annualTurnover = monthlyIncome * 12;

    // Update form values
    update({
      gross_profit: grossProfit,
      annual_turnover: annualTurnover,
    });
  }, [existingForm.monthly_income_estimate, existingForm.working_capital_monthly]);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>4) Investment Details Section</Text>

{/* 17) Initial investment */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          12) What was your Initial Investment for this Enterprise?
        </Text>
        <Text style={styles.helpText}>
          Please enter the approximate total amount of money you used when you first started your enterprise.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.initial_investment || ''}
          onChangeText={(v) => update({ initial_investment: v })}
        />
      </View>
      {/* 12) Monthly income estimate */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          13) What is your total Estimated Monthly Income?
        </Text>
        <Text style={styles.helpText}>
          Please enter the combined approximate income your enterprise earns in one month from all sources.
          You may mention the amount in rupees (e.g. 15000).
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.monthly_income_estimate || ''}
          onChangeText={(v) => update({ monthly_income_estimate: v })}
        />
      </View>

      {/* 13) Annual turnover */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          13) What is your Approximate Annual Turnover?
        </Text>
        <Text style={styles.helpText}>
          Please enter the approximate total amount of sales your enterprise makes in one year.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.annual_turnover || ''}
          onChangeText={(v) => update({ annual_turnover: v })}
        />
      </View> */}

      {/* 14) Gross profit */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>14) What is your Gross Profit?</Text>
        <Text style={styles.helpText}>
          Please enter your gross profit (income minus direct expenses) as you understand it.
          You may put an approximate value.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.gross_profit || ''}
          onChangeText={(v) => update({ gross_profit: v })}
        />
      </View> */}

      {/* 15) Working capital */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>14) What is your Monthly Working Capital?</Text>
        <Text style={styles.helpText}>
          Please enter how much money you normally need every month to run your business
          (for raw material, wages, transport, etc.).
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.working_capital_monthly || ''}
          onChangeText={(v) => update({ working_capital_monthly: v })}
        />
      </View>


      {/* AUTO CALCULATED */}
 {existingForm.monthly_income_estimate && existingForm.working_capital_monthly && (
        <><View style={styles.gpBlock}>
        </View><View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Average Yearly Income Estimate:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.monthly_income_estimate || 0) * 12).toLocaleString('en-IN')}
            </Text>
             <Text style={[styles.label, { marginTop: 8 }]}>Annual Turnover:</Text>
            <Text style={styles.value}>
              ₹ {(existingForm.annual_turnover ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Average Yearly Working Capital:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.working_capital_monthly || 0) * 12).toLocaleString('en-IN')}
            </Text>
           <Text style={styles.label}>Gross Profit:</Text>
          <Text style={styles.value}>
            ₹ {(existingForm.gross_profit ?? 0).toLocaleString('en-IN')}
          </Text>
          </View></>
      )}
       {/* {existingForm.monthly_income_estimate && existingForm.working_capital_monthly && (
        <><View style={styles.gpBlock}>
          <Text style={styles.label}>Monthly Gross Profit:</Text>
          <Text style={styles.gpValue}>
            ₹ {(existingForm.monthly_gp ?? 0).toLocaleString('en-IN')} ({existingForm.monthly_gp_percent ?? '0'}%)
          </Text>

          <Text style={[styles.label, { marginTop: 8 }]}>Yearly Gross Profit:</Text>
          <Text style={styles.gpValue}>
            ₹ {(existingForm.yearly_gp ?? 0).toLocaleString('en-IN')} ({existingForm.yearly_gp_percent ?? '0'}%)
          </Text>
        </View><View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Average Yearly Income Estimate:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.monthly_income_estimate || 0) * 12).toLocaleString('en-IN')}
            </Text>

            <Text style={[styles.label, { marginTop: 6 }]}>Average Yearly Working Capital:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.working_capital_monthly || 0) * 12).toLocaleString('en-IN')}
            </Text>
          </View></>
      )} */}

      
      {/* <TextInput
  style={styles.input}
  keyboardType="numeric"
  value={existingForm.monthly_income_estimate || ''}
  onChangeText={(v) => setExistingForm({ ...existingForm, monthly_income_estimate: v })}
  onEndEditing={() => {
    const { monthlyIncome, workingCapital, monthlyGP, yearlyGP } =
      calculateAndStoreGP(existingForm.monthly_income_estimate, existingForm.working_capital_monthly);

    setExistingForm({
      ...existingForm,
      monthly_income_estimate: String(monthlyIncome),
      working_capital_monthly: String(workingCapital),
      monthly_gp: String(monthlyGP),
      yearly_gp: String(yearlyGP),
    });
  }}
/>

<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={existingForm.working_capital_monthly || ''}
  onChangeText={(v) => setExistingForm({ ...existingForm, working_capital_monthly: v })}
  onEndEditing={() => {
    const { monthlyIncome, workingCapital, monthlyGP, yearlyGP } =
      calculateAndStoreGP(existingForm.monthly_income_estimate, existingForm.working_capital_monthly);

    setExistingForm({
      ...existingForm,
      monthly_income_estimate: String(monthlyIncome),
      working_capital_monthly: String(workingCapital),
      monthly_gp: String(monthlyGP),
      yearly_gp: String(yearlyGP),
    });
  }}
/>
{existingForm.monthly_income_estimate && existingForm.working_capital_monthly && (() => {
  const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
  const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;
  const monthlyGP = monthlyIncome - workingCapital;
  const monthlyGPPercent = monthlyIncome > 0 ? ((monthlyGP / monthlyIncome) * 100).toFixed(2) : 0;

  const yearlyIncome = monthlyIncome * 12;
  const yearlyWorkingCapital = workingCapital * 12;
  const yearlyGP = yearlyIncome - yearlyWorkingCapital;
  const yearlyGPPercent = yearlyIncome > 0 ? ((yearlyGP / yearlyIncome) * 100).toFixed(2) : 0;

  const formatNumber = (value) =>
    value ? Number(String(value).replace(/,/g, '')).toLocaleString('en-IN') : '';

  return (
    <View style={{ marginTop: 10, padding: 12, backgroundColor: '#f2f9f2', borderRadius: 8 }}>
      <Text style={styles.label}>Monthly Gross Profit:</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}>
        ₹ {formatNumber(monthlyGP)} ({monthlyGPPercent}%)
      </Text>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Yearly Income Estimate:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>₹ {formatNumber(yearlyIncome)}</Text>

        <Text style={[styles.label, { marginTop: 6 }]}>Yearly Working Capital:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>₹ {formatNumber(yearlyWorkingCapital)}</Text>

        <Text style={[styles.label, { marginTop: 6 }]}>Yearly Gross Profit:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}>
          ₹ {formatNumber(yearlyGP)} ({yearlyGPPercent}%)
        </Text>
      </View>
    </View>
  );
})()} */}




      {/* 16) SHG CIF funds */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>15) Have your SHG received CIF Funds?</Text>
        <Text style={styles.helpText}>
          Please select Yes if your Self Help Group (SHG) has received Community Investment Fund (CIF) support.
        </Text>
        <YesNoToggle
          value={existingForm.has_shg_cif || ''}
          onChange={(val) => update({ has_shg_cif: val })}
        />

        {hasShgCifYes && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.helpText}>
              Please enter the CIF amount in rupees as given to your SHG.
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={existingForm.cif_fund_amt || ''}
              onChangeText={(v) => update({ cif_fund_amt: v })}
            />
          </View>
        )}
      </View> */}


    <View style={styles.fieldBlock}>
  <Text style={styles.label}>15) Have your SHG received CIF Funds?</Text>
  <Text style={styles.helpText}>
    Please select Yes if your Self Help Group (SHG) has received Community Investment Fund (CIF) support.
  </Text>

  <YesNoToggle
    value={existingForm.has_shg_cif || ''}
    onChange={(val) => update({ has_shg_cif: val, has_part_cif: '', part_cif_amt: '' })}
  />

  {/* Step 2: Have you received part of that CIF fund */}
  {existingForm.has_shg_cif === 'Yes' && (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.label}>Have you received part of that CIF fund?</Text>
      <YesNoToggle
        value={existingForm.has_part_cif || ''}
        onChange={(val) => update({ has_part_cif: val, part_cif_amt: '' })}
      />

      {/* Step 3: If Yes, show amount field */}
      {existingForm.has_part_cif === 'Yes' && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.label}>Specify amount received</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={existingForm.part_cif_amt || ''}
            onChangeText={(v) => update({ part_cif_amt: v })}
            placeholder="Enter CIF amount"
          />
        </View>
      )}
    </View>
  )}
</View>


      {/* 17) Initial investment */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          17) What was your Initial Investment for this Enterprise?
        </Text>
        <Text style={styles.helpText}>
          Please enter the approximate total amount of money you used when you first started your enterprise.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.initial_investment || ''}
          onChangeText={(v) => update({ initial_investment: v })}
        />
      </View> */}

      {/* 18) Source of investment – parent/child tree */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          16) Select all sources of your Investment that apply
        </Text>
        <Text style={styles.helpText}>
          Please select all departments and schemes from where you received support or funds
          for your initial investment. You may choose multiple parents and multiple schemes under them.
        </Text>

        <SourceOfInvestmentTree
          value={existingForm.source_of_investment_tree}
          onChange={(tree) => update({ source_of_investment_tree: tree })}
        />

        <Text style={[styles.helpText, { marginTop: 4 }]}>
          Note: Your selections will be saved as &quot;[Parent: Scheme1, Scheme2]&quot; format
          for sending to the server.
        </Text>
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
  labelSub: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#444',
    fontSize: 13,
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
  yesNoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  yesNoBtnActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  yesNoText: {
    fontSize: 14,
    color: '#333',
  },
  yesNoTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  treeGroup: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  treeParentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treeParentText: {
    fontWeight: '600',
    flex: 1,
  },
  treeChildrenBlock: {
    marginTop: 8,
    paddingLeft: 8,
  },
  treeChildRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  treeChildCheckbox: {
    width: 20,
    fontSize: 16,
  },
  treeChildLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
});
