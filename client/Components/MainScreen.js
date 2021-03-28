import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
  Dimensions,
  Image
} from 'react-native';
import texts from '../texts.json';
import MainScreenButton from './MainScreenButton';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const MainScreen = (props) => {
  const { language, setLanguage, setIsLoading } = props;
  const [imageUri, setImageUri] = useState(null);
  const [imageString, setImageString] = useState(null);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(Dimensions.get('window').width * 0.9);
  const [statusText, setStatusText] = useState("");
  const [processed, setProcessed] = useState(false);
  const changeLang = () => setLanguage(language === 'tr' ? 'en' : 'tr');

  const onSelectRequest = (launch) => {
    const options = {
      mediaType: 'photo',
      includeBase64: true
    };

    const processInfo = (response) => {
      setImageUri(null);
      setProcessed(false);
      setImageString(null);
      setStatusText("");
      if (response.didCancel) {
        setStatusText(texts.selection_canceled[language]);
      }
      else if (response.error) {
        setStatusText(texts.selection_error + " " + response.error);
      }
      else {
        setImageUri(response.uri);
        setImageString(response.base64);
        Image.getSize(response.uri, (width, height) => {
          setImageHeight(height / (width / imageWidth));
        })
      }
    }

    launch(options, processInfo);
  }

  const onSubmit = () => {
    setIsLoading(true);
    setStatusText("");
    fetch("https://object-detection-40b2d.ew.r.appspot.com/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(imageString)
    })
      .then(async (res) => {
        data = await res.json();
        if (res.status === 200) {
          setImageUri(data.url);
          setStatusText(data.count + texts.object_count_text[language]);
          setProcessed(true);
        }
        else {
          setStatusText(data);
        }
      })
      .catch(err => {
        setStatusText(texts.server_error[language] + " " + err)
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      <Pressable onPressIn={changeLang} style={styles.languageContainer}>
        <Text style={styles.languageText}>
          {language === 'tr' ? 'English' : 'Türkçe'}
        </Text>
      </Pressable>

      <MainScreenButton text={texts.choose_image[language]} onPress={() => onSelectRequest(launchImageLibrary)} />
      <MainScreenButton text={texts.take_photo[language]} onPress={() => onSelectRequest(launchCamera)} />

      {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}
      {imageUri ? <Image style={{ width: imageWidth, height: imageHeight, marginBottom: 20 }} source={{ uri: imageUri }} onLoad={() => setIsLoading(false)} /> : null}
      {imageUri && !processed ? <MainScreenButton text={texts.submit[language]} onPress={onSubmit} /> : null}
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  languageContainer: {
    marginBottom: "4%"
  },
  languageText: {
    fontSize: 24,
    color: '#195496',
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: "#195496",
    marginTop: 10
  }
});

export default MainScreen;
