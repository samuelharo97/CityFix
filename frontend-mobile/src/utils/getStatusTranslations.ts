import { ReportStatus } from '../types/report';

export const getStatusTranslations = (status: ReportStatus): string => {
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
      return status;
  }
};
