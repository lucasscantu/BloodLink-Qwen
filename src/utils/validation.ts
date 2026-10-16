import { z } from 'zod';

// Blood Bag Schemas
export const createBloodBagSchema = z.object({
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  volume: z.number().int().min(200, 'Volume mínimo: 200mL').max(600, 'Volume máximo: 600mL'),
  institutionId: z.string().min(1, 'Selecione uma instituição'),
});

export const rejectBloodBagSchema = z.object({
  reason: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres').max(500, 'Motivo muito longo'),
});

export const discardBloodBagSchema = z.object({
  reason: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres').max(500, 'Motivo muito longo'),
});

// Demand Schemas
export const createDemandSchema = z.object({
  institutionId: z.string().min(1, 'Selecione uma instituição'),
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  quantity: z.number().int().min(1, 'Quantidade mínima: 1').max(50, 'Quantidade máxima: 50'),
  urgency: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
});

// Transfer Schemas
export const createTransferSchema = z.object({
  bloodBagId: z.string().min(1, 'Selecione uma bolsa'),
  sourceInstitutionId: z.string().min(1, 'Selecione a instituição de origem'),
  destinationInstitutionId: z.string().min(1, 'Selecione a instituição de destino'),
  demandId: z.string().optional(),
}).refine((data: { sourceInstitutionId: string; destinationInstitutionId: string }) => data.sourceInstitutionId !== data.destinationInstitutionId, {
  message: 'Instituição de origem e destino devem ser diferentes',
  path: ['destinationInstitutionId'],
});

// Institution Schemas
export const createInstitutionSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  type: z.enum(['HEMOCENTRO', 'HOSPITAL']),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  latitude: z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida'),
  longitude: z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida'),
});

// User Schemas
export const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR']),
  institutionId: z.string().optional(),
});

// Temperature Schemas
export const createTemperatureReadingSchema = z.object({
  bloodBagId: z.string().min(1, 'Selecione uma bolsa'),
  temperature: z.number().min(-10, 'Temperatura mínima: -10°C').max(20, 'Temperatura máxima: 20°C'),
  institutionId: z.string().min(1, 'Selecione uma instituição'),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Export types
export type CreateBloodBagInput = z.infer<typeof createBloodBagSchema>;
export type RejectBloodBagInput = z.infer<typeof rejectBloodBagSchema>;
export type DiscardBloodBagInput = z.infer<typeof discardBloodBagSchema>;
export type CreateDemandInput = z.infer<typeof createDemandSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTemperatureReadingInput = z.infer<typeof createTemperatureReadingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
