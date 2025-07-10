import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().length(24, "Invalid doctor id"),
  appointmentDate: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/, "Invalid date format (YYYY-MM-DD)"),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}\s(AM|PM)$/i, "Invalid time format (HH:mm)"),
});

export const updateAppointmentSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}\s(AM|PM)$/i)
    .optional(),
});
