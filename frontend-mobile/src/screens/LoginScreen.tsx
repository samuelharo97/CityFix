import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api, ApiError } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      await api.login(email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        console.log(error);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              CityFix
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
            >
              Entrar
            </Button>

            {/* <Button
              mode="outlined"
              onPress={handleGoogleLogin}
              style={styles.button}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="google" size={size} color={color} />
              )}
            >
              Entrar com Google
            </Button> */}

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.button}
            >
              Não tem uma conta? Cadastre-se
            </Button>
          </View>
        </View>
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
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16
  },
  title: {
    marginBottom: 8
  },
  form: {
    width: '100%'
  },
  input: {
    marginBottom: 16
  },
  button: {
    marginTop: 8
  }
});
