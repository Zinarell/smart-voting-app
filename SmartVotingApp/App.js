import React, { useState, useEffect } from 'react'; 
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Config from './config';
import CreatePollScreen from './Screens/CreatePollScreen.js'
import SharePollScreen from './Screens/SharePollScreen.js';
import PollListScreen from './Screens/PollListScreen';
import VoteScreen from './Screens/VoteScreen';
import PollStatisticsScreen from './Screens/PollStatisticsScreen';
 
// const API_BASE_URL = 'http://192.168.1.XXX:8000';
const API_BASE_URL = Config.API_BASE_URL;
 
export default function App() { 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [userId, setUserId] = useState(null); // Сохранённый ID
  const [message, setMessage] = useState(''); // Сообщения об успехе/ошибке
  const [name, setName] = useState('');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [createdPollId, setCreatedPollId] = useState(null);
  const [selectedPollId, setSelectedPollId] = useState(null);
 
  useEffect(() => {
    const checkUser = async () => {
      try {
        const savedId = await AsyncStorage.getItem('userId');
        const savedName = await AsyncStorage.getItem('userName');
        if (savedId) {
          setUserId(savedId);
          if (savedName) setName(savedName);
          setMessage('С возвращением!');
        }
      } catch (e) {
        console.error("Ошибка чтения из AsyncStorage", e);
      } finally {
        setLoading(false);
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
      
      const response = await axios.post(`${API_BASE_URL}/register`, {
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
      await AsyncStorage.setItem('userName', name);
      
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      setMessage('Ошибка соединения с сервером. Запущен ли бэкенд?');
    }
  };
    const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setUserId(null);
      setName('');
      setMessage('Вы вышли из системы');
      setCurrentScreen('home');
    } catch (e) {
      console.error("Ошибка выхода:", e);
    }
  };
 
  if (loading) { 
    return ( 
        <SafeAreaView style={styles.container}> 
          <ActivityIndicator size="large" color="#0000ff" /> 
          <Text>Загрузка...</Text> 
        </SafeAreaView> 
    ); 
  } 
 
  if (error) { 
    return ( 
        <SafeAreaView style={styles.container}> 
          <Text style={styles.errorText}>Ошибка: {error}</Text> 
        </SafeAreaView> 
    ); 
  } 
 
  // Если пользователь не зарегистрирован — показываем форму регистрации
  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Smart Voting App</Text>
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
        {message && <Text style={styles.message}>{message}</Text>}
      </SafeAreaView>
    );
  }

  // Если пользователь на экране создания опроса
  if (currentScreen === 'createPoll') {
    return (
      
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Smart Voting App</Text>
        <Button title="← Назад к профилю" onPress={() => setCurrentScreen('home')} />
        <View style={{ marginTop: 20, width: '100%' }}>
          <CreatePollScreen onPollCreated={(pollId) => {
            setCreatedPollId(pollId);
            setCurrentScreen('share');
          }} />
        </View>
      </SafeAreaView>
    );
  }

  // Если пользователь на экране шаринга
  if (currentScreen === 'share') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Smart Voting App</Text>
        <Button title="← Назад к профилю" onPress={() => setCurrentScreen('home')} />
        <View style={{ marginTop: 20, flex: 1, width: '100%' }}>
          <SharePollScreen   
          pollId={createdPollId} 
          onBack={() => setCurrentScreen('home')} />
        </View>
      </SafeAreaView>
    );
  }

  // НОВЫЙ ЭКРАН: Список опросов
  if (currentScreen === 'pollList') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Активные опросы</Text>
        <Button title="← Назад к профилю" onPress={() => setCurrentScreen('home')} />
        <View style={{ marginTop: 20, flex: 1, width: '100%' }}>
          <PollListScreen 
            onVote={(pollId) => {
            setSelectedPollId(pollId);
            setCurrentScreen('vote');

          }} />
        </View>
      </SafeAreaView>
    );
  }
  if (currentScreen === 'vote') {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <VoteScreen 
          pollId={selectedPollId} 
          userId={userId}
          onBack={() => setCurrentScreen('pollList')}
          onVoteSuccess={() => setCurrentScreen('statistics')}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
  
}
// Если пользователь на экране статистики
if (currentScreen === 'statistics') {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Smart Voting App</Text>
        <PollStatisticsScreen 
          pollId={selectedPollId} 
          onBack={() => setCurrentScreen('pollList')} 
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

  // Если ни одно условие не сработало — показываем главный экран (профиль)
  return (

    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Smart Voting App</Text>
      <View style={styles.success}>
        <Text style={styles.successText}>Регистрация успешна!</Text>
        <Text style={styles.idText}>Ваш ID: {userId}</Text>
        <Text>Добро пожаловать, {name}!</Text>
        
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Button title="Выйти" onPress={handleLogout} color="#ff5722" />
        </View>
        
        {/* Кнопки действий в профиле */}
        <View style={{ gap: 10 }}>
            <Button title="Создать новый опрос" onPress={() => setCurrentScreen('createPoll')} />
            <Button title="Список активных опросов" onPress={() => setCurrentScreen('pollList')} />
        </View>
      </View>
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