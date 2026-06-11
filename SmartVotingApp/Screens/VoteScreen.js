import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Config from '../config';

const API_BASE_URL = Config.API_BASE_URL;

export default function VoteScreen({ pollId, userId, onBack, onVoteSuccess }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем опрос
        const pollResponse = await axios.get(`${API_BASE_URL}/polls/${pollId}`);
        setPoll(pollResponse.data);
        
        // Проверяем статус голосования
        const statusResponse = await axios.get(`${API_BASE_URL}/vote-status/${pollId}/${userId}`);
        
        if (statusResponse.data.has_voted) {
        //   setHasVoted(true);
        //   setVotedOptionId(statusResponse.data.option_id);
        //   setSelectedOptionId(statusResponse.data.option_id); // Автоматически выделяем выбор
        onVoteSuccess();
        return;
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить опрос');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pollId, userId]);

  const handleVote = async () => {
    if (!selectedOptionId) {
      Alert.alert('Внимание', 'Выберите вариант ответа');
      return;
    }
    
    if (hasVoted) {
      Alert.alert('Информация', 'Вы уже проголосовали в этом опросе');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/vote`, {
        user_id: userId,
        poll_id: pollId,
        option_id: selectedOptionId
      });
      
      // Alert.alert('Успех', response.data.message);
      
      // Обновляем состояние
      setHasVoted(true);
      setVotedOptionId(selectedOptionId);
      
      // Возвращаемся на список опросов
      // onBack();
      onVoteSuccess();
      
    } catch (error) {
      console.error('Ошибка голосования:', error);
      
      if (error.response && error.response.data && error.response.data.detail) {
        Alert.alert('Ошибка', error.response.data.detail);
      } else {
        Alert.alert('Ошибка', 'Не удалось отправить голос');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Загрузка опроса...</Text>
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={styles.center}>
        <Text>Опрос не найден</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Рамочка для вопроса */}
      <View style={styles.questionBox}>
        <Text style={styles.questionLabel}>Вопрос:</Text>
        <Text style={styles.title}>{poll.title}</Text>
        {hasVoted && (
          <Text style={styles.votedBadge}>Вы уже проголосовали</Text>
        )}
      </View>
      
      <Text style={styles.subtitle}>Выберите один из вариантов:</Text>

      {/* 2. Широкие варианты ответов */}
      <View style={styles.optionsContainer}>
        {poll.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isVotedOption = votedOptionId === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                isSelected && styles.selectedOption,
                isVotedOption && styles.votedOption
              ]}
              onPress={() => !hasVoted && setSelectedOptionId(option.id)}
              disabled={hasVoted}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>
                {isVotedOption ? '✅ ' : (isSelected ? '✅ ' : '⬜ ')}{option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Широкие кнопки внизу */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.voteButton, 
            (!selectedOptionId || hasVoted) && styles.disabledButton
          ]} 
          onPress={handleVote}
          disabled={!selectedOptionId || hasVoted}
        >
          <Text style={styles.voteButtonText}>
            {hasVoted ? 'Вы уже проголосовали' : 'Отправить голос'}
          </Text>
        </TouchableOpacity>

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
  votedBadge: {
    marginTop: 10,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  selectedOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  votedOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 17,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  voteButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  voteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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