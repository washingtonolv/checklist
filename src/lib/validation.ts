import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(3, "Informe seu e-mail ou usuário.").max(254),
  password: z.string().min(1, "Informe a senha.")
});

export const resetRequestSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.")
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"]
  });

export const storeSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja."),
  code: z.string().trim().min(1, "Informe o código da loja.").max(30, "Código muito longo."),
  managerId: z.string().uuid().nullable(),
  supervisorIds: z.array(z.string().uuid()).default([]),
  active: z.boolean().default(true)
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do usuário."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
  role: z.enum(["supervisor", "manager"]),
  active: z.boolean().default(true),
  storeIds: z.array(z.string().uuid()).default([])
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do usuário."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined))
    .refine((value) => !value || value.length >= 8, "A senha deve ter no mínimo 8 caracteres."),
  role: z.enum(["supervisor", "manager"]),
  active: z.boolean().default(true),
  storeIds: z.array(z.string().uuid()).default([])
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria."),
  description: z.string().trim().max(400, "Descrição muito longa.").default(""),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const templateSchema = z
  .object({
    title: z.string().trim().min(2, "Informe o nome da atividade."),
    description: z.string().trim().max(1000, "Descrição muito longa.").default(""),
    categoryId: z.string().uuid("Selecione uma categoria."),
    recurrence: z.enum(["daily", "weekly", "monthly", "once"]),
    dueTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Informe um horário válido.")
      .default("18:00"),
    onceDueDate: z.string().optional().nullable(),
    photoRequirement: z.enum(["required", "optional", "none"]),
    active: z.boolean().default(true),
    storeIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos uma loja.")
  })
  .refine((data) => data.recurrence !== "once" || !!data.onceDueDate, {
    message: "Informe a data da atividade pontual.",
    path: ["onceDueDate"]
  });

export const noteSchema = z.object({
  note: z.string().trim().min(3, "Descreva o motivo com pelo menos 3 caracteres.")
});

export const observationSchema = z.object({
  content: z.string().trim().min(2, "Escreva uma observação.")
});

export const completeTaskSchema = z.object({
  observation: z.string().trim().max(1000, "Observação muito longa.").default("")
});

export function parseBoolean(value: FormDataEntryValue | null | undefined): boolean {
  return value === "on" || value === "true" || value === "1";
}

export function formString(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value : "";
}

export function formStringArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.length > 0);
}

