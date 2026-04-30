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
import { LinearGradient } from 'expo-linear-gradient';

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

  const canStart = goal.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>📞</Text>
              </View>
              <Text style={styles.logoName}>CallCopilot</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.profileBtn, pressed && styles.pressed]}>
              <Text style={styles.profileIcon}>⚙️</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>打好每一个{'\n'}英文电话</Text>
            <Text style={styles.heroSub}>
              输入您的通话目标，AI 实时翻译{'\n'}并提供回复建议
            </Text>
          </View>

          {/* Goal Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputCardTitle}>您想完成什么？</Text>
            <Text style={styles.inputCardSub}>What do you need help with on this call?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例如：我想把垃圾桶从大号换成小号..."
              placeholderTextColor="#94A3B8"
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Presets */}
          <View style={styles.presetsHeader}>
            <Text style={styles.presetsTitle}>常见任务</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsScroll}
            style={styles.presetsRow}>
            {PRESETS.map(p => {
              const active = goal === p.en;
              return (
                <Pressable
                  key={p.zh}
                  style={({ pressed }) => [
                    styles.presetCard,
                    active && styles.presetCardActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setGoal(p.en)}>
                  <Text style={[styles.presetZh, active && styles.presetZhActive]}>{p.zh}</Text>
                  <Text
                    style={[styles.presetEn, active && styles.presetEnActive]}
                    numberOfLines={2}>
                    {p.en}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Start Call Gradient Card */}
          <Pressable
            onPress={startCall}
            disabled={!canStart}
            style={({ pressed }) => [
              styles.startWrapper,
              !canStart && styles.startDisabled,
              pressed && canStart && styles.pressed,
            ]}>
            <LinearGradient
              colors={['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startCard}>
              <View>
                <Text style={styles.startCardLabel}>准备好了？</Text>
                <Text style={styles.startCardTitle}>开始通话 / Start Call</Text>
              </View>
              <View style={styles.startIconBox}>
                <Text style={styles.startIconEmoji}>📞</Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Text style={styles.tip}>💡 通话时将手机置于免提模式效果更佳</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },
  content: {
    paddingBottom: 48,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 18 },
  logoName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: { fontSize: 18 },

  // Hero
  hero: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 17,
    color: '#64748B',
    lineHeight: 26,
    marginTop: 12,
    maxWidth: 280,
    fontWeight: '400',
  },

  // Input card
  inputCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  inputCardSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 14,
    fontWeight: '400',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 88,
    lineHeight: 22,
    backgroundColor: '#F8FAFC',
  },

  // Presets
  presetsHeader: {
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  presetsRow: {
    marginBottom: 24,
  },
  presetsScroll: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 10,
  },
  presetCard: {
    minWidth: 140,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
  },
  presetCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  presetZh: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  presetZhActive: { color: '#0284C7' },
  presetEn: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '400',
  },
  presetEnActive: { color: '#0EA5E9' },

  // Start card
  startWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 32,
    overflow: 'hidden',
  },
  startDisabled: { opacity: 0.35 },
  startCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  startCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  startCardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  startIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startIconEmoji: { fontSize: 22 },

  // Tip
  tip: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
    fontWeight: '400',
  },
});
