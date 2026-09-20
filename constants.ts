import { ReportCategory, ReportStatus } from "./types";

export const CATEGORY_COLORS = {
  [ReportCategory.KEBERSIHAN]: 'bg-green-100 text-green-800',
  [ReportCategory.KERUSAKAN]: 'bg-red-100 text-red-800',
  [ReportCategory.TAMAN]: 'bg-green-100 text-green-800',
  [ReportCategory.SALURAN]: 'bg-blue-100 text-blue-800',
  [ReportCategory.LAINNYA]: 'bg-gray-100 text-gray-800',
};

export const STATUS_COLORS = {
  [ReportStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ReportStatus.ACCEPTED]: 'bg-green-100 text-green-800',
  [ReportStatus.REJECTED]: 'bg-red-100 text-red-800',
};

export const getCategoryColor = (category: string): string => {
  switch(category.toUpperCase()) {
    case 'KEBERSIHAN':
      return 'bg-green-100 text-green-800';
    case 'KERUSAKAN':
      return 'bg-red-100 text-red-800';
    case 'TAMAN':
      return 'bg-green-100 text-green-800';
    case 'SALURAN':
      return 'bg-blue-100 text-blue-800';
    case 'LAINNYA':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};