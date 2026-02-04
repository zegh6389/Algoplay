// Reading Library - Algorithm Lessons with AI Simplify
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { algorithmLessons, lessonCategories, Lesson } from '@/constants/lessons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function CategoryTab({
  category,
  isSelected,
  onPress,
}: {
  category: { id: string; name: string; icon: string; color?: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        isSelected && styles.categoryTabActive,
        isSelected && category.color && { borderColor: category.color },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={category.icon as keyof typeof Ionicons.glyphMap}
        size={16}
        color={isSelected ? (category.color || Colors.actionTeal) : Colors.gray500}
      />
      <Text
        style={[
          styles.categoryTabText,
          isSelected && styles.categoryTabTextActive,
          isSelected && category.color && { color: category.color },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInRight.delay(index * 60).springify()}>
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => router.push(`/library/${lesson.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.lessonCardHeader}>
          <View style={[styles.lessonIcon, { backgroundColor: lesson.color + '20' }]}>
            <Ionicons
              name={lesson.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={lesson.color}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDescription} numberOfLines={2}>
              {lesson.shortDescription}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray500} />
        </View>

        <View style={styles.complexityRow}>
          <View style={styles.complexityItem}>
            <Ionicons name="time-outline" size={12} color={Colors.gray500} />
            <Text style={styles.complexityLabel}>Avg:</Text>
            <Text style={styles.complexityValue}>{lesson.timeComplexity.average}</Text>
          </View>
          <View style={styles.complexityItem}>
            <Ionicons name="cube-outline" size={12} color={Colors.gray500} />
            <Text style={styles.complexityLabel}>Space:</Text>
            <Text style={styles.complexityValue}>{lesson.spaceComplexity}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: lesson.color + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: lesson.color }]}>
              {lesson.category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeaturedLesson() {
  const router = useRouter();
  const featuredLesson = algorithmLessons.find(l => l.id === 'quick-sort')!;

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push(`/library/${featuredLesson.id}`)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[featuredLesson.color, featuredLesson.color + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={Colors.logicGold} />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{featuredLesson.title}</Text>
            <Text style={styles.featuredDescription}>
              {featuredLesson.content.overview.slice(0, 100)}...
            </Text>
            <View style={styles.featuredButton}>
              <Text style={styles.featuredButtonText}>Read More</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.midnightBlue} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredLessons = useMemo(() => {
    if (selectedCategory === 'all') return algorithmLessons;
    return algorithmLessons.filter(lesson => lesson.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Text style={styles.title}>Reading Library</Text>
        <Text style={styles.subtitle}>Deep dive into algorithm theory</Text>
      </Animated.View>

      {/* Category Tabs */}
      <Animated.View entering={FadeInDown.delay(50)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {lessonCategories.map((cat) => (
            <CategoryTab
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Lesson */}
        {selectedCategory === 'all' && <FeaturedLesson />}

        {/* Lessons List */}
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'All Lessons' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Lessons`}
        </Text>
        {filteredLessons.map((lesson, index) => (
          <LessonCard key={lesson.id} lesson={lesson} index={index} />
        ))}

        {filteredLessons.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={Colors.gray600} />
            <Text style={styles.emptyText}>No lessons in this category yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnightBlue,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    marginTop: 2,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: Colors.actionTeal + '20',
    borderColor: Colors.actionTeal,
  },
  categoryTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
    marginLeft: Spacing.xs,
  },
  categoryTabTextActive: {
    color: Colors.actionTeal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  featuredCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  featuredGradient: {
    padding: Spacing.lg,
    minHeight: 180,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 4,
    marginBottom: Spacing.md,
  },
  featuredBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  featuredDescription: {
    fontSize: FontSizes.md,
    color: Colors.white + 'CC',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  featuredButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.midnightBlue,
  },
  lessonCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  lessonDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 18,
  },
  complexityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  complexityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  complexityLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  complexityValue: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray300,
    fontFamily: 'monospace',
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginLeft: 'auto',
  },
  categoryBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.gray500,
    marginTop: Spacing.md,
  },
});
