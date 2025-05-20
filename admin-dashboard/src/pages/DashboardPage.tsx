import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  GridLegacy as Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Alert
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams
} from '@mui/x-data-grid';
import { ReportStatus, ReportCategory } from '../types';
import type { Report } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import { reportsApi } from '../services/api';
import { GridToolbar } from '@mui/x-data-grid/internals';

const getStatusDetails = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return { label: 'Pendente', color: 'warning' as const };
    case ReportStatus.IN_PROGRESS:
      return { label: 'Em Andamento', color: 'info' as const };
    case ReportStatus.RESOLVED:
      return { label: 'Resolvido', color: 'success' as const };
    case ReportStatus.REJECTED:
      return { label: 'Rejeitado', color: 'error' as const };
    default:
      return { label: status, color: 'default' as const };
  }
};

// Helper function to translate category
const getCategoryLabel = (category: ReportCategory) => {
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
      return category;
  }
};

const DashboardPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getReports();
      setReports(data);
      setError('');
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Falha ao carregar os relatos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/reports/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Título', flex: 1, minWidth: 200 },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        getCategoryLabel(params.value as ReportCategory)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as ReportStatus;
        const { label, color } = getStatusDetails(status);
        return <Chip label={label} color={color} size="small" />;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Data de Criação',
      width: 180,
      renderCell: (params: GridRenderCellParams) =>
        formatDate(params.value as string)
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleViewDetails(params.row.id)}
        >
          Detalhes
        </Button>
      )
    }
  ];

  // Get summary statistics by status
  const statusSummary = Object.values(ReportStatus).map(status => {
    const count = reports.filter(report => report.status === status).length;
    const { label, color } = getStatusDetails(status);
    return { status, label, count, color };
  });

  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Resumo
        </Typography>
        <Grid container spacing={3}>
          {statusSummary.map(({ status, label, count, color }) => (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {label}
                  </Typography>
                  <Typography variant="h3">{count}</Typography>
                  <Chip
                    label={label}
                    color={color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h4">Relatos</Typography>
          <Button variant="contained" onClick={loadReports}>
            Atualizar
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={reports}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            components={{
              Toolbar: GridToolbar
            }}
          />
        </div>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
