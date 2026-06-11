import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import Config from '../config';


const API_BASE_URL = Config.API_BASE_URL

export default function PollListScreen({ onVote }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/polls`);
        setPolls(response.data); // Сохраняем массив опросов
      } catch (error) {
        console.error("Ошибка загрузки опросов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  // Функция, которая описывает, как выглядит ОДИН элемент списка
  const renderPollItem = ({ item }) => {
    return (
      <View style={styles.pollCard}>
        <Text style={styles.pollTitle}>{item.title}</Text>
        <Button 
        title="Проголосовать" 
        onPress={() => onVote(item.id)}  // Вызываем функцию из пропсов
      />
      </View>
    );  
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Загрузка опросов...</Text>
      </View>
    );
  }

  if (polls.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Активных опросов пока нет.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={polls}
      keyExtractor={(item) => item.id} // Уникальный ключ из модели
      renderItem={renderPollItem}      // Как рисовать каждый элемент
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  pollCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pollTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});