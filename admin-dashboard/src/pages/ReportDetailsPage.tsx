import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  GridLegacy as Grid,
  Button,
  Card,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { reportsApi } from '../services/api';
import { ReportStatus } from '../types';
import type { Report } from '../types';
import DashboardLayout from '../components/DashboardLayout';

const statusColors = {
  pending: '#FFC107',
  in_progress: '#2196F3',
  resolved: '#4CAF50',
  rejected: '#F44336'
};

const ReportDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await reportsApi.getReport(id!);
        console.log('Report response:', response);
        setReport(response);
        setStatus(response.status);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report details');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as ReportStatus);
  };

  const updateStatus = async () => {
    if (!status) return;

    try {
      setUpdating(true);
      // Make sure we're sending the exact enum value expected by the backend
      const statusValue = status as ReportStatus;
      console.log('Sending status update:', { status: statusValue });
      await reportsApi.updateReportStatus(id!, statusValue);
      setReport(prev => (prev ? { ...prev, status: statusValue } : null));
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update report status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" color="error">
            {error || 'Report not found'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </DashboardLayout>
    );
  }

  const formatLocation = (location: { x: number; y: number }) => {
    return `${location.x.toFixed(6)}, ${location.y.toFixed(6)}`;
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">Report Details</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="h6">{report.title}</Typography>
              <Chip
                label={report.status}
                sx={{
                  backgroundColor: statusColors[report.status] || '#757575',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Category
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {report.category}
            </Typography>

            <Typography variant="body2" color="textSecondary">
              Location
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatLocation(report.location)}
            </Typography>

            <Typography variant="body2" color="textSecondary">
              Reported By
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {report?.createdBy?.name ?? ''}
            </Typography>

            <Typography variant="body2" color="textSecondary">
              Reported On
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(report.createdAt).toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {report.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <FormControl sx={{ minWidth: 200, mr: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={e => handleStatusChange(e.target.value)}
                  label="Status"
                  disabled={updating}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={updateStatus}
                disabled={updating || status === report.status}
              >
                {updating ? <CircularProgress size={24} /> : 'Update Status'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {report.imageUrl && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Primary Image
          </Typography>
          <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
            <CardMedia
              component="img"
              height="400"
              image={report.imageUrl}
              alt={`Report image`}
              sx={{ objectFit: 'contain' }}
            />
          </Card>
        </Paper>
      )}

      {report.mediaUrls && report.mediaUrls.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Additional Media
          </Typography>
          <Grid container spacing={2}>
            {report.mediaUrls.map((media, index) => {
              // Check if media is video by file extension
              const isVideo = /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(media);

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  {isVideo ? (
                    <Box sx={{ mb: 2 }}>
                      <video
                        controls
                        width="100%"
                        style={{ maxHeight: '200px' }}
                        src={media}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  ) : (
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={media}
                        alt={`Media ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </DashboardLayout>
  );
};

export default ReportDetailsPage;
