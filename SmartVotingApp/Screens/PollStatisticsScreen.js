import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Config from '../config';

const API_BASE_URL = Config.API_BASE_URL;

export default function PollStatisticsScreen({ pollId, onBack }) {
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем данные опроса
        const pollResponse = await axios.get(`${API_BASE_URL}/polls/${pollId}`);
        setPoll(pollResponse.data);
        
        // Загружаем результаты голосования
        const resultsResponse = await axios.get(`${API_BASE_URL}/polls/${pollId}/results`);
        setResults(resultsResponse.data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pollId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Загрузка статистики...</Text>
      </View>
    );
  }

  if (!poll || !results) {
    return (
      <View style={styles.center}>
        <Text>Данные не найдены</Text>
      </View>
    );
  }

  // Считаем общее количество голосов
  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.questionBox}>
        <Text style={styles.questionLabel}>Результаты опроса:</Text>
        <Text style={styles.title}>{poll.title}</Text>
        <Text style={styles.totalVotes}>Всего голосов: {totalVotes}</Text>
      </View>

      {/* Статистика по вариантам */}
      <View style={styles.resultsContainer}>
        {Object.entries(results).map(([optionText, count]) => {
          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          
          return (
            <View key={optionText} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.optionText}>{optionText}</Text>
                <Text style={styles.countText}>
                  {count} {count === 1 ? 'голос' : 'голосов'} ({percentage.toFixed(1)}%)
                </Text>
              </View>
              
              {/* Гистограмма */}
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { width: `${percentage}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Кнопка назад */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Назад к списку опросов</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionBox: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0d47a1',
  },
  totalVotes: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    marginBottom: 20,
    width: '100%', // ЖЁСТКАЯ ширина
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%', // ЖЁСТКАЯ ширина
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1, // Позволяет сжиматься, но не растягиваться
    maxWidth: '70%', // Ограничиваем ширину текста
  },
  countText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 0, // Не сжимается
  },
  barContainer: {
    width: '100%', // ЖЁСТКАЯ ширина
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});