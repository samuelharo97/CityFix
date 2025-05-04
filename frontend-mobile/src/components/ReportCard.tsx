import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ReportResponseDto, ReportStatus } from '../types/report';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ReportCardProps {
  report: ReportResponseDto;
}

export default function ReportCard({ report }: ReportCardProps) {
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

  return (
    <View style={styles.card}>
      {report.imageUrl && (
        <Image source={{ uri: report.imageUrl }} style={styles.image} />
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
            <Text style={styles.statusText}>{report.status}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {report.description}
        </Text>

        {report.streetName && (
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {report.streetName}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{report.category}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  image: {
    width: '100%',
    height: 200
  },
  content: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  category: {
    fontSize: 12,
    color: '#666'
  },
  date: {
    fontSize: 12,
    color: '#999'
  }
});
