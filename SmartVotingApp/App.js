import React, { useState, useEffect } from 'react'; 
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; 
 
const API_BASE_URL = 'http://192.168.1.XXX:8000'; 
 
export default function App() { 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
 
  useEffect(() => { 
    // Здесь будут инициализироваться данные или проверяться токен пользователя 
    setLoading(false); // Временно, пока нет логики 
  }, []); 
 
  if (loading) { 
    return ( 
      <SafeAreaProvider> 
        <SafeAreaView style={styles.container}> 
          <ActivityIndicator size="large" color="#0000ff" /> 
          <Text>Загрузка...</Text> 
        </SafeAreaView> 
      </SafeAreaProvider> 
    ); 
  } 
 
  if (error) { 
    return ( 
      <SafeAreaProvider> 
        <SafeAreaView style={styles.container}> 
          <Text style={styles.errorText}>Ошибка: {error}</Text> 
        </SafeAreaView> 
      </SafeAreaProvider> 
    ); 
  } 
 
  return ( 
    <SafeAreaProvider> 
      <SafeAreaView style={styles.container}> 
        <Text style={styles.title}>Добро пожаловать в Smart 
Voting!</Text> 
        {/* Здесь будет рендериться основное содержимое 
приложения */} 
      </SafeAreaView> 
    </SafeAreaProvider> 
  ); 
} 
 
const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 20, 
  }, 
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
  }, 
errorText: { 
color: 'red', 
fontSize: 16, 
}, 
});