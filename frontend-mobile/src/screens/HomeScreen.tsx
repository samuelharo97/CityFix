import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReports } from '../hooks/useReports';
import { ReportStatus } from '../types/report';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  Avatar,
  useTheme,
  ActivityIndicator,
  FAB
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStatusTranslations } from '../utils';

type RootStackParamList = {
  Home: undefined;
  CreateReport: undefined;
  ReportDetails: { reportId: string };
  MyReports: undefined;
  Map: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { reports, fetchReports, loading, error } = useReports();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchReports().finally(() => setRefreshing(false));
  }, [fetchReports]);

  const pendingReports = reports.filter(
    report => report.status === ReportStatus.PENDING
  ).length;
  const inProgressReports = reports.filter(
    report => report.status === ReportStatus.IN_PROGRESS
  ).length;
  const resolvedReports = reports.filter(
    report => report.status === ReportStatus.RESOLVED
  ).length;

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={theme.colors.error}
          />
          <Text style={[styles.errorText, { marginTop: 16 }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Card style={styles.welcomeCard}>
              <Card.Content>
                <Title style={styles.welcomeTitle}>Bem-vindo ao CityFix</Title>
                <Paragraph>
                  Ajude a melhorar sua cidade reportando problemas no seu bairro
                </Paragraph>
                <Button
                  mode="contained"
                  style={styles.reportButton}
                  onPress={() => navigation.navigate('CreateReport')}
                >
                  Fazer Nova Denúncia
                </Button>
              </Card.Content>
            </Card>

            <Title style={styles.sectionTitle}>Visão Geral</Title>
            <View style={styles.statsContainer}>
              <Card
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.error }
                ]}
              >
                <Card.Content style={styles.statContent}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={24}
                    color="#fff"
                  />
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {pendingReports}
                  </Text>
                  <Text style={styles.statLabel}>Pendentes</Text>
                </Card.Content>
              </Card>

              <Card
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.primary }
                ]}
              >
                <Card.Content style={styles.statContent}>
                  <MaterialCommunityIcons
                    name="progress-clock"
                    size={24}
                    color="#fff"
                  />
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {inProgressReports}
                  </Text>
                  <Text style={styles.statLabel}>Em andamento</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: '#2E7D32' }]}>
                <Card.Content style={styles.statContent}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#fff"
                  />
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {resolvedReports}
                  </Text>
                  <Text style={styles.statLabel}>Resolvidos</Text>
                </Card.Content>
              </Card>
            </View>

            <Title style={styles.sectionTitle}>Ações rápidas</Title>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('CreateReport')}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.colors.primary }
                  ]}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Nova Denúncia</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('MyReports')}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}
                >
                  <MaterialCommunityIcons
                    name="clipboard-list"
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text style={styles.actionText}>Minhas Denúncias</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Map')}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text style={styles.actionText}>Mapa</Text>
              </TouchableOpacity>
            </View>

            <Title style={styles.sectionTitle}>Denúncias Recentes</Title>
            {recentReports.length > 0 ? (
              recentReports.map(report => (
                <Card
                  key={report.id}
                  style={styles.reportCard}
                  onPress={() =>
                    navigation.navigate('ReportDetails', {
                      reportId: report.id
                    })
                  }
                >
                  <Card.Content>
                    <View style={styles.reportHeader}>
                      <View style={styles.reportInfo}>
                        <Title style={styles.reportTitle} numberOfLines={1}>
                          {report.title}
                        </Title>
                        <Paragraph
                          numberOfLines={2}
                          style={styles.reportDescription}
                        >
                          {report.description}
                        </Paragraph>
                      </View>
                      {report.imageUrl && (
                        <Avatar.Image
                          size={60}
                          source={{ uri: report.imageUrl }}
                          style={styles.reportImage}
                        />
                      )}
                    </View>
                    <View style={styles.reportFooter}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              report.status === ReportStatus.PENDING
                                ? theme.colors.error
                                : report.status === ReportStatus.IN_PROGRESS
                                ? theme.colors.primary
                                : '#2E7D32'
                          }
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getStatusTranslations(report.status)}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={48}
                    color={theme.colors.outline}
                  />
                  <Text style={styles.emptyText}>
                    Nenhuma denúncia encontrada
                  </Text>
                </Card.Content>
              </Card>
            )}

            <Button
              mode="outlined"
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('MyReports')}
            >
              Ver todas as denúncias
            </Button>
          </ScrollView>

          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => navigation.navigate('CreateReport')}
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
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 80 : 30
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomeCard: {
    marginBottom: 24,
    elevation: 2
  },
  welcomeTitle: {
    marginBottom: 8,
    fontWeight: 'bold'
  },
  reportButton: {
    marginTop: 16
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2
  },
  statContent: {
    alignItems: 'center',
    padding: 12
  },
  statNumber: {
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 4
  },
  statLabel: {
    color: 'white',
    fontSize: 12
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  actionButton: {
    alignItems: 'center',
    flex: 1
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center'
  },
  reportCard: {
    marginBottom: 12,
    elevation: 2
  },
  reportHeader: {
    flexDirection: 'row'
  },
  reportInfo: {
    flex: 1,
    marginRight: 8
  },
  reportTitle: {
    fontSize: 16,
    marginBottom: 4
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  reportImage: {
    marginLeft: 'auto'
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  dateText: {
    fontSize: 12,
    color: '#666'
  },
  emptyCard: {
    marginBottom: 16
  },
  emptyContent: {
    alignItems: 'center',
    padding: 24
  },
  emptyText: {
    marginTop: 8,
    color: '#666'
  },
  viewAllButton: {
    marginBottom: 16
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16
  }
});
