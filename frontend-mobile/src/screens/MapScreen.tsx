import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Dimensions,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReports } from '../hooks/useReports';
import { ReportCategory, ReportStatus } from '../types/report';
import { useTheme } from 'react-native-paper';
import * as Location from 'expo-location';
import { getCategoryTranslation } from '../utils/getCategoryTranslations';
import { getStatusTranslations } from '../utils/getStatusTranslations';

type RootStackParamList = {
  ReportDetails: { reportId: string };
};

type MapScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportDetails'
>;

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { reports, loading, error, fetchReports } = useReports();
  const theme = useTheme();
  const [initialRegion, setInitialRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    getUserLocation();
  }, [fetchReports]);

  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        setInitialRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const getMarkerColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'red';
      case ReportStatus.IN_PROGRESS:
        return 'blue';
      case ReportStatus.RESOLVED:
        return 'green';
      case ReportStatus.REJECTED:
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (loading || locationLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
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
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
          >
            {reports.map(report => (
              <Marker
                key={report.id}
                coordinate={{
                  latitude: report.location.y,
                  longitude: report.location.x
                }}
                title={report.title}
                description={`${getCategoryTranslation(
                  report.category
                )} - ${getStatusTranslations(report.status)}${
                  report.streetName ? ` - ${report.streetName}` : ''
                }`}
                pinColor={getMarkerColor(report.status)}
                onCalloutPress={() =>
                  navigation.navigate('ReportDetails', { reportId: report.id })
                }
              />
            ))}
          </MapView>
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
    flex: 1
  },
  map: {
    flex: 1
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    fontSize: 16
  }
});
