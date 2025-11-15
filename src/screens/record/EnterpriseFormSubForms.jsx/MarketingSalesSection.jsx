import React, { useContext } from 'react';
import { View, Text, TextInput, Picker } from 'react-native';
import { LanguageContext } from '../../components/LanguageContext';
import { styles, inputStyle } from './FormStyles'; // Extract common styles if needed
import { t } from './translations'; // Utility for translations

export default function MarketingSalesSection({ form, setField }) {
  const { language } = useContext(LanguageContext);

  return (
    <View>
      <Text style={styles.sectionTitle}>{t(language, 'marketing_sales')}</Text>

      {['target_customers','monthly_sales','marketing_strategy','marketing_challenges'].map(key => (
        <View key={key}>
          <Text style={styles.inputLabel}>{t(language, key)}</Text>
          <TextInput
            value={form[key]}
            onChangeText={v => setField(key, v)}
            style={inputStyle}
            multiline={['marketing_strategy','marketing_challenges'].includes(key)}
            keyboardType={key==='monthly_sales'?'numeric':'default'}
          />
        </View>
      ))}

      <Text style={styles.inputLabel}>{t(language, 'marketing_channels')}</Text>
      <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
        <Picker selectedValue={form.marketing_channels || ''} onValueChange={(v)=>setField('marketing_channels', v)}>
          <Picker.Item label={t(language, 'option_retail')} value="Retail" />
          <Picker.Item label={t(language, 'option_online')} value="Online" />
          <Picker.Item label={t(language, 'option_exhibition')} value="Exhibition" />
          <Picker.Item label={t(language, 'option_others')} value="Others" />
        </Picker>
      </View>
      {form.marketing_channels === 'Others' && (
        <TextInput placeholder="Specify" value={form.marketing_channels_other} onChangeText={v => setField('marketing_channels_other', v)} style={inputStyle} />
      )}
    </View>
  );
}
