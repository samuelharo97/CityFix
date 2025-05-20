import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Person,
  CalendarToday,
  Category
} from '@mui/icons-material';
import { reportsApi } from '../services/api';
import { ReportStatus, ReportCategory } from '../types';
import type { Report } from '../types';
import DashboardLayout from '../components/DashboardLayout';

const statusColors = {
  pending: '#FFC107',
  in_progress: '#2196F3',
  resolved: '#4CAF50',
  rejected: '#F44336'
};

// Função para traduzir as categorias
const getCategoryTranslation = (category: ReportCategory): string => {
  switch (category) {
    case ReportCategory.INFRASTRUCTURE:
      return 'Infraestrutura';
    case ReportCategory.ENVIRONMENT:
      return 'Meio Ambiente';
    case ReportCategory.SAFETY:
      return 'Segurança';
    case ReportCategory.OTHER:
      return 'Outros';
    default:
      return String(category);
  }
};

// Função para traduzir os status
const getStatusTranslation = (status: ReportStatus): string => {
  switch (status) {
    case ReportStatus.PENDING:
      return 'Pendente';
    case ReportStatus.IN_PROGRESS:
      return 'Em Andamento';
    case ReportStatus.RESOLVED:
      return 'Resolvido';
    case ReportStatus.REJECTED:
      return 'Rejeitado';
    default:
      return String(status);
  }
};

const ReportDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const theme = useTheme();

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
        setError('Falha ao carregar os detalhes do relato');
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
      const statusValue = status as ReportStatus;
      console.log('Sending status update:', { status: statusValue, comment });
      await reportsApi.updateReportStatus(id!, statusValue, comment);
      setReport(prev => (prev ? { ...prev, status: statusValue } : null));
      setComment('');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Falha ao atualizar o status do relato');
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
            {error || 'Relato não encontrado'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Voltar ao Dashboard
          </Button>
        </Paper>
      </DashboardLayout>
    );
  }

  const formatLocation = (location: { x: number; y: number }) => {
    return `${location.x.toFixed(6)}, ${location.y.toFixed(6)}`;
  };

  return (
    <DashboardLayout title="Detalhes do Relato">
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h5">Detalhes do Relato</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ width: '100%' }}>
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
              label={getStatusTranslation(report.status)}
              sx={{
                backgroundColor: statusColors[report.status] || '#757575',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Category sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Categoria
                  </Typography>
                  <Typography variant="body1">
                    {getCategoryTranslation(report.category)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Localização
                  </Typography>
                  <Typography variant="body1">
                    {formatLocation(report.location)}
                  </Typography>
                  {report.streetName && (
                    <Typography variant="body1" color="textSecondary">
                      {report.streetName}
                    </Typography>
                  )}
                </Box>
              </Box>

              {report?.createdBy?.name && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Reportado por
                    </Typography>
                    <Typography variant="body1">
                      {report?.createdBy?.name ?? ''}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CalendarToday
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Data do Relato
                  </Typography>
                  <Typography variant="body1">
                    {new Date(report.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Descrição
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, whiteSpace: 'pre-wrap' }}
              >
                {report.description}
              </Typography>

              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 3, mb: 1 }}
              >
                Atualizar Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={e => handleStatusChange(e.target.value)}
                    label="Status"
                    disabled={updating}
                  >
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="in_progress">Em Andamento</MenuItem>
                    <MenuItem value="resolved">Resolvido</MenuItem>
                    <MenuItem value="rejected">Rejeitado</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Comentário (opcional)"
                  multiline
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  fullWidth
                  disabled={updating}
                  placeholder="Adicione informações sobre a atualização de status"
                />

                <Button
                  variant="contained"
                  onClick={updateStatus}
                  disabled={updating || status === report.status}
                  fullWidth
                >
                  {updating ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Atualizar Status'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {report.imageUrl && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Evidência Principal
          </Typography>
          <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
            <CardMedia
              component="img"
              height="400"
              image={report.imageUrl}
              alt={`Imagem do relato`}
              sx={{ objectFit: 'contain' }}
            />
          </Card>
        </Paper>
      )}

      {report.mediaUrls && report.mediaUrls.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mídias Adicionais
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 2
            }}
          >
            {report.mediaUrls.map((media, index) => {
              // Check if media is video by file extension
              const isVideo = /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(media);

              return (
                <Box key={index}>
                  {isVideo ? (
                    <Box sx={{ mb: 2 }}>
                      <video
                        controls
                        width="100%"
                        style={{ maxHeight: '200px' }}
                        src={media}
                      >
                        Seu navegador não suporta a tag de vídeo.
                      </video>
                    </Box>
                  ) : (
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={media}
                        alt={`Mídia ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
    </DashboardLayout>
  );
};

export default ReportDetailsPage;
