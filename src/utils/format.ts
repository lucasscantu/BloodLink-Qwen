import { BLOOD_TYPE_LABELS, BloodType, STATUS_LABELS, BloodBagStatus, DEMAND_STATUS_COLORS, DemandStatus, URGENCY_COLORS, DemandUrgency, TRANSFER_STATUS_COLORS, TransferStatus } from '../types';

/**
 * Formata data para exibição em pt-BR
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para exibição em pt-BR
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

/**
 * Formata tipo sanguíneo para exibição
 */
export function formatBloodType(type: BloodType): string {
  return BLOOD_TYPE_LABELS[type];
}

/**
 * Formata status de bolsa para exibição
 */
export function formatBloodBagStatus(status: BloodBagStatus): string {
  return STATUS_LABELS[status];
}

/**
 * Formata volume em mL
 */
export function formatVolume(volume: number): string {
  return `${volume} mL`;
}

/**
 * Trunca texto com ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formata hash blockchain para exibição
 */
export function formatHash(hash: string, length: number = 10): string {
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

/**
 * Calcula tempo relativo (ex: "há 2 dias")
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  return formatDate(date);
}

/**
 * Gera classe CSS para status de demanda
 */
export function getDemandStatusClass(status: DemandStatus): string {
  return DEMAND_STATUS_COLORS[status];
}

/**
 * Gera classe CSS para urgência
 */
export function getUrgencyClass(urgency: DemandUrgency): string {
  return URGENCY_COLORS[urgency];
}

/**
 * Gera classe CSS para status de transferência
 */
export function getTransferStatusClass(status: TransferStatus): string {
  return TRANSFER_STATUS_COLORS[status];
}
