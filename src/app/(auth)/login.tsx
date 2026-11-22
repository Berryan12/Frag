import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, styles } from '../../constants/styles';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [callsign, setCallsign] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');

  async function handleAuth(): Promise<void> {
    setErrorMessage('');
    setInfoMessage('');

    if (!supabase) {
      setErrorMessage('Supabase is not configured. Add your project URL and anon key to .env.');
      return;
    }

    const cleanEmail = email.trim();
    const cleanCallsign = callsign.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (isRegistering && !cleanCallsign) {
      setErrorMessage('Enter a callsign to create your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { callsign: cleanCallsign },
          },
        });

        if (error) throw error;

        if (data.session) {
          setInfoMessage('Account created. Opening FRAG...');
        } else {
          setInfoMessage('Account created. Check your email to confirm, then sign in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;
        setInfoMessage('Login successful. Opening FRAG...');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Authentication failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode(): void {
    setIsRegistering((current) => !current);
    setErrorMessage('');
    setInfoMessage('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.authPage}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
          <View style={styles.authLogo}>
            <Ionicons name="stats-chart" size={34} color={COLORS.red} />
          </View>

          <Text style={styles.brand}>FRAG</Text>
          <Text style={styles.authSubtitle}>PLAYER STATS & AGENT FINDER</Text>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.mutedText}>
              {isRegistering
                ? 'Register a FRAG account to save your missions.'
                : 'Sign in to access your FRAG dashboard.'}
            </Text>

            {isRegistering && (
              <>
                <Text style={styles.formLabel}>CALLSIGN</Text>
                <TextInput
                  value={callsign}
                  onChangeText={setCallsign}
                  placeholder="Your callsign"
                  placeholderTextColor={COLORS.muted}
                  style={styles.formInput}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
              </>
            )}

            <Text style={styles.formLabel}>EMAIL</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={COLORS.muted}
              style={styles.formInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isSubmitting}
            />

            <Text style={styles.formLabel}>PASSWORD</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={COLORS.muted}
              style={styles.formInput}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={isRegistering ? 'new-password' : 'password'}
              editable={!isSubmitting}
            />

            {errorMessage !== '' && (
              <Text style={styles.formError}>{errorMessage}</Text>
            )}
            {infoMessage !== '' && (
              <Text style={styles.formSuccess}>{infoMessage}</Text>
            )}

            <Pressable
              style={[styles.formButton, isSubmitting && styles.disabledButton]}
              onPress={() => void handleAuth()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={styles.formButtonText}>
                  {isRegistering ? 'Register' : 'Sign In'}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={toggleMode} disabled={isSubmitting} style={styles.modeButton}>
              <Text style={styles.modeButtonText}>
                {isRegistering
                  ? 'Already have an account? Sign in'
                  : 'New here? Create an account'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.authFootnote}>
            Your login session is stored securely on supported mobile devices.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
