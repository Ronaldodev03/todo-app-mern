import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  status: z.enum(['pending', 'in-progress', 'completed'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Prioridad inválida' }),
  }),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (date) => {
        if (!date || date === '') return true;
        const selectedDate = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: 'La fecha de vencimiento no puede estar en el pasado',
      }
    ),
});
