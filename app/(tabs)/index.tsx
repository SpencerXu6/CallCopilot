import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESETS = [
  { zh: '更改垃圾桶大小', en: 'I want to change my garbage bin size.' },
  { zh: '银行账户问题', en: 'I have a question about my bank account.' },
  { zh: '预约医生', en: 'I want to schedule a doctor appointment.' },
  { zh: '账单问题', en: 'I have a question about my bill.' },
  { zh: '更改地址', en: 'I need to update my address.' },
  { zh: '取消服务', en: 'I want to cancel my service.' },
];

export default function HomeScreen() {
  const [goal, setGoal] = useState('');

  const startCall = () => {
    const trimmed = goal.trim();
    if (!trimmed) return;
    router.push({ pathname: '/call', params: { goal: trimmed } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>📞</Text>
            </View>
            <Text style={styles.appName}>CallCopilot</Text>
            <Text style={styles.appSub}>通话助手 · Your Call Assistant</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>您想完成什么任务？</Text>
            <Text style={styles.cardSub}>What do you need help with on this call?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例如：我想把垃圾桶从大号换成小号..."
              placeholderTextColor="#9CA3AF"
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.presetsTitle}>常见任务 / Common Tasks</Text>
          <View style={styles.presetGrid}>
            {PRESETS.map(p => {
              const active = goal === p.en;
              return (
                <Pressable
                  key={p.zh}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                  onPress={() => setGoal(p.en)}>
                  <Text style={[styles.presetZh, active && styles.presetTextActive]}>{p.zh}</Text>
                  <Text
                    style={[styles.presetEn, active && styles.presetTextActive]}
                    numberOfLines={1}>
                    {p.en}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.startBtn, !goal.trim() && styles.startBtnDisabled]}
            onPress={startCall}
            disabled={!goal.trim()}>
            <Text style={styles.startBtnText}>开始通话 / Start Call</Text>
          </Pressable>

          <Text style={styles.tip}>
            💡 开始后，输入客服说的话，AI 会实时提供翻译和建议
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 90,
    lineHeight: 22,
  },
  presetsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  presetChip: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#FFFFFF',
    maxWidth: '47%',
  },
  presetChipActive: {
    borderColor: '#0a7ea4',
    backgroundColor: '#EFF6FF',
  },
  presetZh: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  presetEn: {
    fontSize: 11,
    color: '#94A3B8',
  },
  presetTextActive: {
    color: '#0a7ea4',
  },
  startBtn: {
    marginHorizontal: 20,
    backgroundColor: '#0a7ea4',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  startBtnDisabled: {
    opacity: 0.35,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tip: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
