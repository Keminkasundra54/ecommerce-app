import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api } from '@/api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email) return;
    setLoading(true);
    try {
      // Call your backend endpoint (see server addition below)
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Check your email', 'If your email exists, you will receive reset instructions.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Info', 'If your email exists, you will receive reset instructions.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <TextInput style={styles.input} placeholder="Your account email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading || !email}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send reset link</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  btn: { backgroundColor: 'black', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' }
});
