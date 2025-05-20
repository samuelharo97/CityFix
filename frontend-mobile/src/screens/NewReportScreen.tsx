import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  SegmentedButtons,
  IconButton
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ReportCategory } from '../types';
import { api } from '../services/api';
import { CreateReportDto } from '../types/report';
import { VideoView, useVideoPlayer } from 'expo-video';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Coordinates for Manduri, São Paulo
const MANDURI_COORDINATES = {
  latitude: -23.00056,
  longitude: -49.32639,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421
};

// Create a separate video component to manage its own hooks
const VideoPreview = ({ uri, style }: { uri: string; style: any }) => {
  const player = useVideoPlayer(uri);
  return <VideoView style={style} player={player} nativeControls />;
};

type NewReportScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type MediaFile = {
  uri: string;
  type: 'image' | 'video';
  filename?: string;
};

export default function NewReportScreen({ navigation }: NewReportScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('other');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(MANDURI_COORDINATES);
  const theme = useTheme();

  useEffect(() => {
    // Only initialize the map region to Manduri, don't set a location marker
    setMapRegion(MANDURI_COORDINATES);
  }, []);

  const initializeUserLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const userPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        // Update map region with user's position
        const userRegion = {
          latitude: userPosition.coords.latitude,
          longitude: userPosition.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        };

        setMapRegion(userRegion);

        // Automatically get the address for the user's location
        const [address] = await Location.reverseGeocodeAsync({
          latitude: userPosition.coords.latitude,
          longitude: userPosition.coords.longitude
        });

        if (address) {
          // Set user's current location and address
          setLocation({
            latitude: userPosition.coords.latitude,
            longitude: userPosition.coords.longitude,
            address: [
              address.street,
              address.district,
              address.city,
              address.region
            ]
              .filter(Boolean)
              .join(', ')
          });
        }
      }
    } catch (error) {
      console.log('Error initializing location:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true
    });

    // Remove deprecated property to avoid warning
    delete (result as any).cancelled;

    if (!result.canceled) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? ('video' as const) : ('image' as const),
        filename: asset.uri.split('/').pop()
      }));
      setMediaFiles([...mediaFiles, ...newFiles]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Desculpe, precisamos de permissão para acessar a câmera!');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        aspect: [4, 3],
        quality: 1,
        videoMaxDuration: 60 // 1 minute max
      });

      // Remove deprecated property to avoid warning
      delete (result as any).cancelled;

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newFile = {
          uri: asset.uri,
          type:
            asset.type === 'video' ? ('video' as const) : ('image' as const),
          filename: asset.uri.split('/').pop()
        };
        setMediaFiles([...mediaFiles, newFile]);
      }
    } catch (error) {
      console.error('Error taking photo/video:', error);
      alert('Erro ao capturar mídia. Tente novamente.');
    }
  };

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert(
          'Desculpe, precisamos de permissão para acessar sua localização!'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address
          ? [address.street, address.district, address.city, address.region]
              .filter(Boolean)
              .join(', ')
          : undefined
      };

      setLocation(newLocation);

      // Update map region
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    } catch (error) {
      alert('Erro ao obter localização. Tente novamente.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;

    try {
      setLocationLoading(true);

      // Create a temporary marker at the tapped location
      setLocation({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: 'Obtendo endereço...'
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      });

      setLocation({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: address
          ? [address.street, address.district, address.city, address.region]
              .filter(Boolean)
              .join(', ')
          : 'Localização selecionada no mapa'
      });
    } catch (error) {
      alert('Erro ao obter endereço. Tente novamente.');

      // Keep the marker but with generic address
      setLocation({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: 'Localização selecionada no mapa'
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const confirmMapLocation = () => {
    setMapVisible(false);
  };

  const openMapModal = () => {
    // Use the current location if set, otherwise use Manduri coordinates
    setMapRegion(
      location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }
        : MANDURI_COORDINATES
    );
    setMapVisible(true);
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setCategory('other');
    setMediaFiles([]);
    setLocation(null);
  };

  const uploadFiles = async (files: MediaFile[]) => {
    try {
      const uploadPromises = files.map(async file => {
        const formData = new FormData();

        // Extract filename from URI or generate a unique one
        const filename =
          file.filename ||
          `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${
            file.type === 'video' ? '.mp4' : '.jpg'
          }`;

        // In React Native, we need to create the file object with specific properties
        // that the backend's multer can understand
        const fileObject = {
          uri:
            Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: filename,
          type: file.type === 'video' ? 'video/mp4' : 'image/jpeg'
        } as any;

        console.log('Uploading file:', fileObject);

        // Append to FormData - 'file' is the field name expected by the backend
        formData.append('file', fileObject);

        try {
          return await api.uploadFile(formData);
        } catch (uploadError) {
          console.error('Error in individual file upload:', uploadError);
          throw uploadError;
        }
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload media files');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      alert('Por favor, preencha os campos de título e descrição!');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = '';
      let mediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        const uploadedUrls = await uploadFiles(mediaFiles);

        if (mediaFiles[0].type === 'image') {
          imageUrl = uploadedUrls[0];
        }
        mediaUrls = uploadedUrls;
      }

      const reportData: any = {
        title,
        description,
        category,
        imageUrl,
        mediaUrls
      };

      // Only add location data if a location has been selected
      if (location) {
        reportData.location = {
          x: location.longitude,
          y: location.latitude
        };
        reportData.streetName = location.address;
      } else {
        // Use Manduri coordinates as fallback if no location selected
        reportData.location = {
          x: MANDURI_COORDINATES.longitude,
          y: MANDURI_COORDINATES.latitude
        };
        reportData.streetName = 'Manduri, São Paulo';
      }

      await api.createReport(reportData as CreateReportDto);

      clearForm();
      alert('Denúncia enviada com sucesso!');
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Erro ao enviar denúncia: ${error.message}`);
      } else {
        alert('Erro ao enviar denúncia. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.form}>
            <TextInput
              label="Título"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <Text variant="bodyMedium" style={styles.label}>
              Categoria
            </Text>
            <SegmentedButtons
              value={category}
              onValueChange={setCategory as (value: string) => void}
              buttons={[
                { value: 'infrastructure', label: 'Infraestrutura' },
                { value: 'environment', label: 'Meio Ambiente' },
                { value: 'safety', label: 'Segurança' },
                { value: 'other', label: 'Outros' }
              ]}
              style={styles.segmentedButtons}
            />

            <Text variant="bodyMedium" style={styles.label}>
              Fotos/Vídeos
            </Text>
            <View style={styles.mediaContainer}>
              {mediaFiles.map((file, index) => (
                <View key={index} style={styles.mediaItem}>
                  {file.type === 'image' ? (
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.mediaPreview}
                    />
                  ) : (
                    <VideoPreview uri={file.uri} style={styles.mediaPreview} />
                  )}
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() =>
                      setMediaFiles(mediaFiles.filter((_, i) => i !== index))
                    }
                    style={styles.removeButton}
                  />
                </View>
              ))}
              <View style={styles.mediaButtons}>
                <Button
                  mode="outlined"
                  onPress={pickImage}
                  icon="image"
                  style={styles.mediaButton}
                >
                  Galeria
                </Button>
                <Button
                  mode="outlined"
                  onPress={takePhoto}
                  icon="camera"
                  style={styles.mediaButton}
                >
                  Câmera
                </Button>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.label}>
              Localização
            </Text>
            <View style={styles.locationButtonsContainer}>
              <Button
                mode="outlined"
                onPress={getLocation}
                icon="crosshairs-gps"
                loading={locationLoading}
                style={styles.locationButton}
              >
                Usar minha localização
              </Button>
              <Button
                mode="outlined"
                onPress={openMapModal}
                icon="map-marker"
                style={styles.locationButton}
              >
                Selecionar no mapa
              </Button>
            </View>

            {location && (
              <View style={styles.selectedLocation}>
                <Text variant="bodyMedium" style={styles.locationText}>
                  {location.address ||
                    `${location.latitude.toFixed(
                      4
                    )}, ${location.longitude.toFixed(4)}`}
                </Text>
                <IconButton icon="pencil" size={20} onPress={openMapModal} />
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                onPress={handleMapPress}
              >
                {location && (
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude
                    }}
                    draggable
                    onDragEnd={e => handleMapPress(e)}
                  />
                )}
              </MapView>
              <View style={styles.mapControls}>
                <Text variant="bodyMedium">
                  {location
                    ? 'Arraste o marcador para ajustar a localização'
                    : 'Toque no mapa para selecionar uma localização'}
                </Text>
                <View style={styles.mapButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => setMapVisible(false)}
                    style={[styles.mapButton, styles.cancelButton]}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmMapLocation}
                    style={styles.mapButton}
                    disabled={!location}
                  >
                    Confirmar
                  </Button>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 80 : 30 // Extra padding for bottom navigation
  },
  form: {
    padding: 16
  },
  input: {
    marginBottom: 16
  },
  label: {
    marginBottom: 8
  },
  segmentedButtons: {
    marginBottom: 16
  },
  mediaContainer: {
    marginBottom: 16
  },
  mediaItem: {
    position: 'relative',
    marginBottom: 8
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  mediaButton: {
    flex: 1,
    marginHorizontal: 4
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  locationButton: {
    flex: 1,
    marginHorizontal: 4
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16
  },
  locationText: {
    flex: 1,
    marginRight: 8
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20 // More bottom margin for the submit button
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalContainer: {
    flex: 1
  },
  map: {
    width: Dimensions.get('window').width,
    height:
      Dimensions.get('window').height - (Platform.OS === 'android' ? 185 : 150)
  },
  mapControls: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    backgroundColor: 'white'
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: Platform.OS === 'android' ? 16 : 12
  },
  mapButton: {
    flex: 1,
    marginHorizontal: 4
  },
  cancelButton: {
    borderColor: '#ccc'
  }
});
