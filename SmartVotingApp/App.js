import React, { useState, useEffect } from 'react'; 
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; 
 
const API_BASE_URL = 'http://192.168.1.XXX:8000'; 
 
export default function App() { 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [userId, setUserId] = useState(null); // Сохранённый ID
  const [message, setMessage] = useState(''); // Сообщения об успехе/ошибке
 
  useEffect(() => {
    const checkUser = async () => {
      try {
        const savedId = await AsyncStorage.getItem('userId');
        if (savedId) {
          setUserId(savedId);
          setMessage('С возвращением!');
        }
      } catch (e) {
        console.error("Ошибка чтения из AsyncStorage", e);
      }
    };
    checkUser();
  }, []); 
    const handleRegister = async () => {
    if (!name.trim()) {
      setMessage('Пожалуйста, введите имя');
      return;
    }

    try {
      // ВАЖНО: Адрес сервера зависит от того, где ты запускаешь приложение!
      // Для Android эмулятора: 'http://10.0.2.2:8000/register'
      // Для iOS симулятора или браузера: 'http://localhost:8000/register'
      // Для реального телефона в одной Wi-Fi сети: 'http://192.168.x.x:8000/register' (узнай свой IP)
      
      const response = await axios.post('http://10.0.2.2:8000/register', {
        name: name,
      });

      // Достаём данные из ответа сервера
      const newUserId = response.data.user_id;
      const serverMessage = response.data.message;

      // Обновляем состояние, чтобы интерфейс перерисовался
      setUserId(newUserId);
      setMessage(serverMessage);

      // Сохраняем ID в память телефона на будущее
      await AsyncStorage.setItem('userId', newUserId);
      
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      setMessage('Ошибка соединения с сервером. Запущен ли бэкенд?');
    }
  };
 
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Smart Voting App</Text>

       {/* Если ID ещё нет, показываем форму регистрации */}
      {!userId ? (
        <View style={styles.form}>
          <Text style={styles.label}>Введите ваше имя для регистрации:</Text>
          <TextInput
            style={styles.input}
            placeholder="Иван Петров"
            value={name}
            onChangeText={setName}
          />
          <Button title="Получить ID" onPress={handleRegister} />
        </View>
      ) : (
        // Если ID уже есть, показываем приветствие
        <View style={styles.success}>
          <Text style={styles.successText}>Регистрация успешна!</Text>
          <Text style={styles.idText}>Ваш ID: {userId}</Text>
          <Text>Добро пожаловать, {name}!</Text>
        </View>
      )}

      {/* Блок для вывода сообщений об ошибках или статусе */}
      {message && !userId && <Text style={styles.message}>{message}</Text>}
    </SafeAreaView>
  );
} 
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  success: {
    alignItems: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  idText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  message: {
    color: 'red',
    marginTop: 15,
  }
});