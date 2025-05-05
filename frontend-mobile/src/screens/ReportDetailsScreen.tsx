import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  useWindowDimensions,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';
import { useReports } from '../hooks/useReports';
import {
  ReportResponseDto,
  ReportStatus,
  ReportCategory
} from '../types/report';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Video, ResizeMode } from 'expo-av';
import { getStatusTranslations } from '../utils/getStatusTranslations';
import { getCategoryTranslation } from '../utils/getCategoryTranslations';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  ReportDetails: { reportId: string };
};

type ReportDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportDetails'
>;

type RouteParams = {
  reportId: string;
};

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export default function ReportDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<ReportDetailsScreenNavigationProp>();
  const { reportId } = route.params as RouteParams;
  const { getReport, updateReportStatus, loading } = useReports();
  const [report, setReport] = useState<ReportResponseDto | null>(null);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      const data = await getReport(reportId);
      setReport(data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar detalhes do relato');
      navigation.goBack();
    }
  };

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    try {
      await updateReportStatus(reportId, {
        status: newStatus
      });
      // Reload report to get updated data
      const updatedReport = await getReport(reportId);
      setReport(updatedReport);
      setShowStatusOptions(false);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar status do relato');
    }
  };

  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi');
  };

  const renderMediaItem = (url: string, index: number) => {
    if (isVideo(url)) {
      return (
        <View key={index} style={styles.mediaItemContainer}>
          <Video
            source={{ uri: url }}
            style={styles.mediaVideo}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
          />
        </View>
      );
    } else {
      return (
        <TouchableOpacity key={index} style={styles.mediaItemContainer}>
          <Image
            source={{ uri: url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
  };

  if (loading || !report) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
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
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {report.imageUrl && (
            <Image
              source={{ uri: report.imageUrl }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          )}

          {report.mediaUrls && report.mediaUrls.length > 0 && (
            <ScrollView
              horizontal
              style={styles.mediaContainer}
              showsHorizontalScrollIndicator={false}
            >
              {report.mediaUrls.map((url, index) =>
                renderMediaItem(url, index)
              )}
            </ScrollView>
          )}

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{report.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(report.status) }
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusTranslations(report.status)}
                </Text>
              </View>
            </View>

            {!isMobile && (
              <>
                <TouchableOpacity
                  style={styles.updateStatusButton}
                  onPress={() => setShowStatusOptions(!showStatusOptions)}
                >
                  <Text style={styles.updateStatusText}>
                    {showStatusOptions ? 'Cancelar' : 'Atualizar Status'}
                  </Text>
                </TouchableOpacity>

                {showStatusOptions && (
                  <View style={styles.statusOptions}>
                    {Object.values(ReportStatus).map(status => (
                      <TouchableOpacity
                        key={status}
                        style={styles.statusOption}
                        onPress={() => handleStatusUpdate(status)}
                      >
                        <Text style={styles.statusOptionText}>
                          {getStatusTranslations(status)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <Text style={styles.description}>{report.description}</Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Categoria</Text>
                <Text style={styles.infoValue}>
                  {getCategoryTranslation(report.category)}
                </Text>
              </View>

              {report.streetName && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Endereço</Text>
                  <View style={styles.streetContainer}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color="#6c757d"
                    />
                    <Text style={styles.infoValue}>{report.streetName}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Coordenadas</Text>
                <Text style={styles.infoValue}>
                  {`${report.location.x.toFixed(
                    6
                  )}, ${report.location.y.toFixed(6)}`}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Criado em</Text>
                <Text style={styles.infoValue}>
                  {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Última atualização</Text>
                <Text style={styles.infoValue}>
                  {new Date(report.updatedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return '#FF3B30';
    case ReportStatus.IN_PROGRESS:
      return '#007AFF';
    case ReportStatus.RESOLVED:
      return '#34C759';
    case ReportStatus.REJECTED:
      return '#FF9500';
    default:
      return '#8E8E93';
  }
};

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
    paddingBottom: Platform.OS === 'android' ? 80 : 30 // Extra padding for bottom navigation
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainImage: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16
  },
  content: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
    color: '#212529'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  updateStatusButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  updateStatusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  statusOptions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statusOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  statusOptionText: {
    fontSize: 16,
    color: '#212529'
  },
  description: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 24,
    lineHeight: 24,
    letterSpacing: 0.1
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  infoItem: {
    marginBottom: 16
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500'
  },
  mediaContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa'
  },
  mediaItemContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 12
  },
  mediaVideo: {
    width: 200,
    height: 200,
    borderRadius: 12
  },
  streetContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
