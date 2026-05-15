import { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutRow } from '../components/WorkoutRow';
import { PillButton } from '../components/PillButton';
import { ActionSheet } from '../components/ActionSheet';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/useTheme';
import { loadWorkouts, deleteWorkout, saveWorkout, newId } from '../src/storage';
import { workoutDurationSec } from '../src/expandWorkout';
import type { Workout } from '../src/types';

export default function WorkoutListScreen() {
  const t = useTheme();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const [menuFor, setMenuFor] = useState<Workout | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadWorkouts().then((ws) => {
        if (alive) setWorkouts(ws);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const handleNew = async () => {
    const w: Workout = {
      id: newId(),
      name: '',
      prepSeconds: 10,
      rounds: 3,
      restBetweenRoundsSeconds: 30,
      exercises: [
        { id: newId(), name: 'Exercise 1', workSeconds: 30, restAfterSeconds: 15 },
      ],
      updatedAt: Date.now(),
      version: 1,
    };
    await saveWorkout(w);
    router.push(`/edit/${w.id}`);
  };

  const handleMore = (w: Workout) => {
    setMenuFor(w);
  };

  const closeMenu = () => setMenuFor(null);

  const editFromMenu = (w: Workout) => {
    router.push(`/edit/${w.id}`);
  };

  const deleteFromMenu = async (w: Workout) => {
    const next = await deleteWorkout(w.id);
    setWorkouts(next);
  };

  const isEmpty = workouts.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.canvas }]} edges={['top']}>
      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={[typography.title3, { color: t.labelPrimary, textAlign: 'center' }]}>
            No workouts yet
          </Text>
          <Text
            style={[
              typography.subheadline,
              { color: t.labelSecondary, textAlign: 'center', marginTop: 6 },
            ]}
          >
            Create your first interval workout to get started.
          </Text>
          <View style={{ marginTop: 20 }}>
            <PillButton title="Create workout" icon="add" onPress={handleNew} />
          </View>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(w) => w.id}
          renderItem={({ item }) => (
            <WorkoutRow
              name={item.name}
              exerciseCount={item.exercises.length}
              totalDurationSec={workoutDurationSec(item)}
              onPress={() => router.push(`/run/${item.id}`)}
              onMore={() => handleMore(item)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={[styles.sep, { backgroundColor: t.divider }]} />
          )}
          ListHeaderComponent={
            <View style={styles.newBtnWrap}>
              <PillButton
                title="New workout"
                icon="add"
                variant="outline"
                fullWidth
                onPress={handleNew}
              />
            </View>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
      <ActionSheet
        visible={menuFor !== null}
        title={menuFor?.name || 'Untitled workout'}
        items={
          menuFor
            ? [
                {
                  label: 'Edit',
                  icon: 'create-outline',
                  onPress: () => editFromMenu(menuFor),
                },
                {
                  label: 'Delete',
                  icon: 'trash-outline',
                  destructive: true,
                  onPress: () => void deleteFromMenu(menuFor),
                },
              ]
            : []
        }
        onClose={closeMenu}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  sep: { height: 1, marginHorizontal: 16 },
  newBtnWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
});
