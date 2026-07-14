import { z } from 'zod';

export const vsCodeSnippetSchema = z.object({
    prefix: z.string().min(1, "El prefijo es requerido"),
    description: z.string().optional(),
    scope: z.string().optional(),
    isFileTemplate: z.boolean().default(false),
    body: z.array(z.string()).min(1, "El cuerpo del snippet no puede estar vacío"),
    key: z.string().optional()
});
export type VsCodeSnippet = z.infer<typeof vsCodeSnippetSchema>;