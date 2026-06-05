import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import Config from '../config'; // Не забудь импортировать твой конфиг с URL

export default function CreatePollScreen({ onPollCreated }) {
  const [title, setTitle] = useState('');
  // Начинаем с одного пустого варианта ответа
  const [options, setOptions] = useState([{ id: Date.now().toString(), text: '' }]);
  const [message, setMessage] = useState('');
  const API_BASE_URL = Config.API_BASE_URL;

  // Функция добавления нового поля
  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), text: '' }]);
  };

  // Функция обновления текста конкретного варианта
  const updateOption = (id, newText) => {
    const updatedOptions = options.map(opt => 
      opt.id === id ? { ...opt, text: newText } : opt
    );
    setOptions(updatedOptions);
  };

  // Функция удаления варианта (если их больше одного)
  const removeOption = (id) => {
    if (options.length > 1) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const handleCreatePoll = async () => {
    // Валидация
    if (!title.trim()) {
      setMessage('Введите заголовок опроса');
      return;
    }
    
    // Проверяем, что все варианты заполнены
    const emptyOptions = options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      setMessage('Заполните все варианты ответов');
      return;
    }

    try {
      // Отправляем на бэкенд только массив текстов, как требует API
      const optionsTexts = options.map(opt => opt.text.trim());
      
      const response = await axios.post(`${API_BASE_URL}/polls`, {
        title: title.trim(),
        options: optionsTexts
      });

      setMessage(`Опрос '${response.data.title}' успешно создан!`);
      
      // Очищаем форму
      setTitle('');
      setOptions([{ id: Date.now().toString(), text: '' }]);
      
      // Если передали функцию обратного вызова, вызываем её (например, чтобы вернуться на главный экран)
      if (onPollCreated) onPollCreated();

    } catch (error) {
      console.error("Ошибка создания опроса:", error);
      setMessage('Ошибка соединения с сервером');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Создание нового опроса</Text>

      <Text style={styles.label}>Заголовок опроса:</Text>
      <TextInput
        style={styles.input}
        placeholder="Например: Любимый фрукт?"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Варианты ответов:</Text>
      {options.map((option, index) => (
        <View key={option.id} style={styles.optionRow}>
          <TextInput
            style={[styles.input, styles.optionInput]}
            placeholder={`Вариант ${index + 1}`}
            value={option.text}
            onChangeText={(text) => updateOption(option.id, text)}
          />
          {options.length > 1 && (
            <Button title="✕" color="red" onPress={() => removeOption(option.id)} />
          )}
        </View>
      ))}

      <Button title="+ Добавить вариант" onPress={addOption} color="#2196F3" />
      
      <View style={styles.createButtonContainer}>
        <Button title="Создать опрос" onPress={handleCreatePoll} />
      </View>

      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0, // Переопределяем margin из общего input
  },
  createButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  }
});