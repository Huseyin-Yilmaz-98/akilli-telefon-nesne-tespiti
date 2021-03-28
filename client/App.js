import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, View, Platform, NativeModules} from 'react-native';
import Loading from './Components/Loading';
import MainScreen from './Components/MainScreen';

const getLanguage = () => {
  const language =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      : NativeModules.I18nManager.localeIdentifier;

  const languageCode =
    language.split('_')[0].split('-')[0].toLowerCase() || 'en';
  return languageCode === 'tr' ? 'tr' : 'en';
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(getLanguage() || 'en');

  return (
    <>
      <View style={styles.backgroundView}>
        <MainScreen language={language} setLanguage={setLanguage} setIsLoading={setIsLoading} />
      </View>
      {isLoading ? <Loading /> : null}
    </>
  );
};

const styles = StyleSheet.create({
  backgroundView: {
    backgroundColor: '#f5f1e6',
    width: '100%',
    height: '100%',
  },
});

export default App;
