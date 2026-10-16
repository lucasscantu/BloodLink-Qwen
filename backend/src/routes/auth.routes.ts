import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { validate } from '../middleware/validate';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'HEMOCENTRO', 'HOSPITAL', 'AUDITOR']),
  institutionId: z.string().optional(),
});

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
});

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});
