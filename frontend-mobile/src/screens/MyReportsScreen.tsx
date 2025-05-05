import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  Chip,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useReports } from '../hooks/useReports';
import {
  ReportResponseDto,
  ReportStatus,
  ReportCategory
} from '../types/report';
import { getCategoryTranslation, getStatusTranslations } from '../utils';

type MyReportsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function MyReportsScreen({ navigation }: MyReportsScreenProps) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const { reports, loading, error, fetchMyReports } = useReports();
  const theme = useTheme();

  useEffect(() => {
    fetchMyReports();
  }, []);

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return theme.colors.error;
      case ReportStatus.IN_PROGRESS:
        return theme.colors.primary;
      case ReportStatus.RESOLVED:
        return theme.colors.tertiary;
      case ReportStatus.REJECTED:
        return '#FF9500';
      default:
        return theme.colors.onSurfaceDisabled;
    }
  };

  const getCategoryIcon = (category: ReportCategory) => {
    switch (category) {
      case ReportCategory.INFRASTRUCTURE:
        return 'road';
      case ReportCategory.ENVIRONMENT:
        return 'tree';
      case ReportCategory.SAFETY:
        return 'shield';
      default:
        return 'alert';
    }
  };

  const filteredReports = reports.filter(
    report => statusFilter === 'all' || report.status === statusFilter
  );

  const renderReportCard = ({ item }: { item: ReportResponseDto }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('ReportDetails', { reportId: item.id })
      }
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">{item.title}</Text>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={{ borderColor: getStatusColor(item.status) }}
          >
            {getStatusTranslations(item.status)}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.categoryContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.category)}
              size={16}
              color={theme.colors.primary}
            />
            <Text variant="bodySmall" style={styles.category}>
              {getCategoryTranslation(item.category)}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text
          variant="bodyLarge"
          style={[styles.emptyText, { color: theme.colors.error }]}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          <View style={styles.filterContainer}>
            <SegmentedButtons
              value={statusFilter}
              onValueChange={setStatusFilter as (value: string) => void}
              buttons={[
                { value: 'all', label: 'Todos' },
                { value: ReportStatus.PENDING, label: 'Pendentes' },
                { value: ReportStatus.IN_PROGRESS, label: 'Em Andamento' },
                { value: ReportStatus.RESOLVED, label: 'Resolvidos' }
              ]}
              style={styles.filter}
            />
          </View>

          <FlatList
            data={filteredReports}
            renderItem={renderReportCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchMyReports} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={48}
                  color={theme.colors.onSurfaceDisabled}
                />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Nenhuma denúncia encontrada
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white'
  },
  filter: {
    marginBottom: 8
  },
  list: {
    padding: 16
  },
  card: {
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  description: {
    marginBottom: 8
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  category: {
    marginLeft: 4,
    textTransform: 'capitalize'
  },
  date: {
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyText: {
    marginTop: 16,
    color: '#666'
  }
});
