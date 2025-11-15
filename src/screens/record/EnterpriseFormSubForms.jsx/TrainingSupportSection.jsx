import React, { useContext } from 'react';
import { View, Text, TextInput, Picker } from 'react-native';
import { LanguageContext } from '../../components/LanguageContext';
import { styles, inputStyle } from './FormStyles';
import { t } from './translations';

export default function TrainingSupportSection({ form, setField }) {
  const { language } = useContext(LanguageContext);

  return (
    <View>
      <Text style={styles.sectionTitle}>{t(language, 'training_support')}</Text>

      {['training_received','skills_acquired','future_training_requirements','financial_coordination','mentorship_support'].map(key => (
        <View key={key}>
          <Text style={styles.inputLabel}>{t(language, key)}</Text>
          <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
        </View>
      ))}

      <Text style={styles.inputLabel}>{t(language, 'institutional_support')}</Text>
      <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
        <Picker selectedValue={form.institutional_support || ''} onValueChange={(v)=>setField('institutional_support', v)}>
          <Picker.Item label={t(language, 'option_nrlm')} value="NRLM" />
          <Picker.Item label={t(language, 'option_srlm')} value="SRLM" />
          <Picker.Item label={t(language, 'option_others')} value="Others" />
        </Picker>
      </View>
      {form.institutional_support === 'Others' && (
        <TextInput placeholder="Specify" value={form.institutional_support_other} onChangeText={v => setField('institutional_support_other', v)} style={inputStyle} />
      )}

      <Text style={styles.inputLabel}>{t(language, 'market_linkage')}</Text>
      <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
        <Picker selectedValue={form.market_linkage || ''} onValueChange={(v)=>setField('market_linkage', v)}>
          <Picker.Item label={t(language, 'option_ondc')} value="ONDC" />
          <Picker.Item label={t(language, 'option_ecommerce')} value="E-commerce" />
          <Picker.Item label={t(language, 'option_exhibition')} value="Exhibition" />
          <Picker.Item label={t(language, 'option_others')} value="Others" />
        </Picker>
      </View>
      {form.market_linkage === 'Others' && (
        <TextInput placeholder="Specify" value={form.market_linkage_other} onChangeText={v => setField('market_linkage_other', v)} style={inputStyle} />
      )}

      <Text style={styles.inputLabel}>{t(language, 'expansion_plan')}</Text>
      <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
        <Picker selectedValue={form.expansion_plan || ''} onValueChange={(v)=>setField('expansion_plan', v)}>
          <Picker.Item label={t(language, 'option_new_product')} value="New Product" />
          <Picker.Item label={t(language, 'option_ecommerce_plan')} value="E-Commerce" />
          <Picker.Item label={t(language, 'option_employment')} value="Employment" />
          <Picker.Item label={t(language, 'option_others')} value="Others" />
        </Picker>
      </View>
      {form.expansion_plan === 'Others' && (
        <TextInput placeholder="Specify" value={form.expansion_plan_other} onChangeText={v => setField('expansion_plan_other', v)} style={inputStyle} />
      )}

      <Text style={styles.inputLabel}>{t(language, 'required_support')}</Text>
      <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
        <Picker selectedValue={form.required_support || ''} onValueChange={(v)=>setField('required_support', v)}>
          <Picker.Item label={t(language, 'option_finance')} value="Finance" />
          <Picker.Item label={t(language, 'option_training')} value="Training" />
          <Picker.Item label={t(language, 'option_advertisement')} value="Advertisement" />
          <Picker.Item label={t(language, 'option_equipments')} value="Equipments" />
          <Picker.Item label={t(language, 'option_others')} value="Others" />
        </Picker>
      </View>
      {form.required_support === 'Others' && (
        <TextInput placeholder="Specify" value={form.required_support_other} onChangeText={v => setField('required_support_other', v)} style={inputStyle} />
      )}
    </View>
  );
}
