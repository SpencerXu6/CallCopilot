import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }).start();
    }
  }, [currentStep]);

  if (!visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onSkip}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />

      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />

        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentStep && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>{step.emoji}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        <View style={styles.btnRow}>
          <Pressable onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}>
            <Text style={styles.nextBtnText}>{isLast ? 'Get started' : 'Next'}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },

  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 44,
  },

  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 24,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 24,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#E5E5EA',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#007AFF',
  },

  emoji: { fontSize: 44, textAlign: 'center', marginBottom: 14 },
  title: {
    fontSize: 22, fontWeight: '700', color: '#000000',
    textAlign: 'center', letterSpacing: -0.3, marginBottom: 8,
  },
  body: {
    fontSize: 15, color: '#6E6E73', textAlign: 'center',
    lineHeight: 23, marginBottom: 28, paddingHorizontal: 8,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 4 },
  skipText: { fontSize: 15, color: '#AEAEB2' },

  nextBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  pressed: { opacity: 0.7 },
});
