import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface TutorialStep {
  emoji: string;
  title: string;
  body: string;
}

interface TutorialProps {
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  visible: boolean;
}

export function TutorialOverlay({ steps, currentStep, onNext, onSkip, visible }: TutorialProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }).start();
    }
  }, [currentStep]);

  if (!visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = steps.map((_, i) => i);

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onSkip}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdropPress} onPress={() => {}} />
      </Animated.View>

      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {progress.map(i => (
            <View key={i} style={[styles.dot, i === currentStep && styles.dotActive]} />
          ))}
        </View>

        {/* Content */}
        <Text style={styles.emoji}>{step.emoji}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip tour</Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => [styles.nextBtnWrapper, pressed && styles.pressed]}>
            <LinearGradient
              colors={['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>{isLast ? 'Get started ✓' : 'Next →'}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdropPress: { flex: 1 },

  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 20,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#0EA5E9',
  },

  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22, fontWeight: '600', color: '#0F172A',
    textAlign: 'center', letterSpacing: -0.3, marginBottom: 10,
  },
  body: {
    fontSize: 15, color: '#64748B', textAlign: 'center',
    lineHeight: 23, marginBottom: 28, paddingHorizontal: 8,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 4 },
  skipText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  nextBtnWrapper: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  nextBtn: { paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
