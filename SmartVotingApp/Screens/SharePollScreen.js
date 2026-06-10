import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import Config from '../config';

const API_BASE_URL = Config.API_BASE_URL;

export default function SharePollScreen({ pollId, onBack }) {
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShareLink = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/polls/${pollId}/share-link`);
        setShareLink(response.data.share_link);
      } catch (error) {
        console.error('Ошибка получения ссылки:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShareLink();
  }, [pollId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Проголосуй в опросе: ${shareLink}`,
      });
    } catch (error) {
      console.error('Ошибка шаринга:', error);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(shareLink);
    Alert.alert('Скопировано!', 'Ссылка скопирована в буфер обмена');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Поделиться опросом</Text>
      
      <View style={styles.qrContainer}>
        <QRCode value={shareLink} size={200} />
      </View>
      
      <Text style={styles.linkText} numberOfLines={2}>
        {shareLink}
      </Text>
      
      <View style={styles.buttonsContainer}>
        <Button title="Скопировать ссылку" onPress={copyToClipboard} />
        <View style={{ marginTop: 10 }}>
          <Button title="Поделиться" onPress={handleShare} />
        </View>
        <View style={{ marginTop: 10 }}>
          <Button title="← Назад" onPress={onBack} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  qrContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linkText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
  }
});