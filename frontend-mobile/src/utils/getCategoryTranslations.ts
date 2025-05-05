import { ReportCategory } from '../types/report';

export const getCategoryTranslation = (category: ReportCategory): string => {
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
