import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api, ApiError } from '../services/api';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await api.register(name, email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof ApiError) {
        if (error.status === 409) {
          Alert.alert(
            'Erro',
            'Este email já está em uso. Por favor, use outro email.'
          );
        } else {
          Alert.alert(
            'Erro',
            error.message ||
              'Ocorreu um erro durante o cadastro. Tente novamente.'
          );
        }
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro durante o cadastro. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Criar Conta
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Nome"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              disabled={loading}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
              disabled={loading}
            />
            {errors.email && (
              <HelperText type="error">{errors.email}</HelperText>
            )}

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!errors.password}
              disabled={loading}
            />
            {errors.password && (
              <HelperText type="error">{errors.password}</HelperText>
            )}

            <TextInput
              label="Confirmar Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!errors.confirmPassword}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <HelperText type="error">{errors.confirmPassword}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Cadastrar
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
              disabled={loading}
            >
              Já tem uma conta? Faça login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 80 : 30
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    marginBottom: 8
  },
  form: {
    width: '100%'
  },
  input: {
    marginBottom: 8
  },
  button: {
    marginTop: 16
  }
});
