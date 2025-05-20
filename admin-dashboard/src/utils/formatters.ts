import {
  PendingActions as PendingIcon,
  Engineering as ProgressIcon,
  CheckCircle as ResolvedIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';
import { ReportStatus, ReportCategory } from '../types';

export const getStatusDetails = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return {
        label: 'Pendente',
        color: 'warning' as const,
        icon: PendingIcon
      };
    case ReportStatus.IN_PROGRESS:
      return {
        label: 'Em Andamento',
        color: 'info' as const,
        icon: ProgressIcon
      };
    case ReportStatus.RESOLVED:
      return {
        label: 'Resolvido',
        color: 'success' as const,
        icon: ResolvedIcon
      };
    case ReportStatus.REJECTED:
      return {
        label: 'Rejeitado',
        color: 'error' as const,
        icon: RejectedIcon
      };
    default:
      return {
        label: String(status),
        color: 'default' as const,
        icon: null
      };
  }
};

export const getCategoryLabel = (category: ReportCategory) => {
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

// Format date using Brazilian format
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
