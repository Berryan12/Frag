import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/styles';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [callsign, setCallsign] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleAuth() {
    // 1. Sanitasi input: hapus spasi tidak terlihat di awal/akhir teks
    const cleanEmail = email.trim();
    const cleanCallsign = callsign.trim();

    if (!cleanEmail || !password) {
      Alert.alert('FRAG Auth', 'Email dan password wajib diisi.');
      return;
    }

    if (isRegistering && !cleanCallsign) {
      Alert.alert('FRAG Auth', 'Masukkan Tactical Callsign kamu terlebih dahulu.');
      return;
    }

    // 2. Aktifkan state loading untuk mencegah multiple submission
    setLoading(true);

    try {
      if (isRegistering) {
        // Mode Sign Up (Registrasi Agen Baru + Metadata Callsign)
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              callsign: cleanCallsign,
              role: 'agent',
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          Alert.alert('Recruitment Complete', `Selamat datang di FRAG HQ, ${cleanCallsign}!`);
        } else {
          Alert.alert('Registrasi Berhasil', 'Silakan cek email atau langsung login.');
          setIsRegistering(false);
        }
      } else {
        // Mode Sign In (Autentikasi Pengguna Lama)
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;
        // Navigasi ke /(app) otomatis ditangani oleh NavigationGuard di _layout.tsx
      }
    } catch (error: any) {
      Alert.alert('Access Denied', error.message ?? 'Gagal melakukan autentikasi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.container}
      >
        <View style={authStyles.card}>
          <Ionicons
            name="shield-half"
            size={56}
            color={COLORS.red}
            style={{ alignSelf: 'center', marginBottom: 12 }}
          />

          <Text style={authStyles.title}>
            {isRegistering ? 'AGENT RECRUITMENT' : 'FRAG HQ SIGN IN'}
          </Text>
          <Text style={authStyles.subtitle}>
            {isRegistering
              ? 'Daftarkan akun untuk menyimpan data statistik & agen favorit'
              : 'Masuk dengan akun terdaftar untuk mengakses tracker'}
          </Text>

          {isRegistering && (
            <TextInput
              value={callsign}
              onChangeText={setCallsign}
              placeholder="Tactical Callsign (e.g. Koyok)"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="words"
              style={authStyles.input}
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Operative Email"
            placeholderTextColor={COLORS.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={authStyles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Access Password (min. 6 karakter)"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            style={authStyles.input}
          />

          <Pressable
            onPress={handleAuth}
            disabled={loading}
            style={[authStyles.submitButton, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={authStyles.submitText}>
                {isRegistering ? 'Enlist as Agent' : 'Authenticate & Enter HQ'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setIsRegistering(!isRegistering)}
            disabled={loading}
            style={authStyles.switchButton}
          >
            <Text style={authStyles.switchText}>
              {isRegistering
                ? 'Sudah punya akun? Sign In di sini'
                : 'Belum punya kredensial? Register di sini'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: COLORS.red,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});