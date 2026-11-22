import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../constants/styles';

const TOKEN_KEY = 'frag-demo-hero-license';
const DEMO_TOKEN = 'FRAG-DEMO-LICENSE-001';

export default function SecureVaultDemo() {
  const [message, setMessage] = useState<string>('No demo token loaded.');
  const [isBusy, setIsBusy] = useState<boolean>(false);

  async function saveToken(): Promise<void> {
    setIsBusy(true);
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, DEMO_TOKEN);
      setMessage('Demo token saved in SecureStore.');
    } catch {
      setMessage('Could not save the token on this device.');
    } finally {
      setIsBusy(false);
    }
  }

  async function loadToken(): Promise<void> {
    setIsBusy(true);
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      setMessage(token ? `Retrieved token: ${token}` : 'No token was found.');
    } catch {
      setMessage('Could not retrieve the token.');
    } finally {
      setIsBusy(false);
    }
  }

  async function clearToken(): Promise<void> {
    setIsBusy(true);
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setMessage('Demo token removed from SecureStore.');
    } catch {
      setMessage('Could not remove the token.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>SECURE TOKEN VAULT</Text>
      <Text style={styles.apiNote}>
        Codelab 1 · A separate demo token used to test secure save, read, and delete.
      </Text>

      {Platform.OS === 'web' ? (
        <Text style={styles.formError}>
          Expo SecureStore is intended for Android and iOS. Open FRAG in Expo Go to test this feature.
        </Text>
      ) : (
        <>
          <Text style={styles.vaultMessage}>{message}</Text>
          <View style={styles.vaultActions}>
            <Pressable
              style={[styles.smallActionButton, isBusy && styles.disabledButton]}
              onPress={() => void saveToken()}
              disabled={isBusy}
            >
              <Text style={styles.smallActionText}>Save</Text>
            </Pressable>
            <Pressable
              style={[styles.smallActionButton, isBusy && styles.disabledButton]}
              onPress={() => void loadToken()}
              disabled={isBusy}
            >
              <Text style={styles.smallActionText}>Retrieve</Text>
            </Pressable>
            <Pressable
              style={[styles.smallActionButton, isBusy && styles.disabledButton]}
              onPress={() => void clearToken()}
              disabled={isBusy}
            >
              <Text style={styles.smallActionText}>Clear</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
