import { z } from "zod";

export const idSchema = z.enum(["scriptFileAccess"]);
export type Id = z.TypeOf<typeof idSchema>;

export const actionSchema = z.enum(["apply", "clear"]);
export type Action = z.TypeOf<typeof actionSchema>;

export const executionSchema = z.array(z.object({ id: idSchema, action: actionSchema }));
export type Execution = z.TypeOf<typeof executionSchema>;

export const modeSchema = z.enum(["enabled", "disabled", "auto"]);
export type Mode = z.TypeOf<typeof modeSchema>;

export const setModeSchema = z.array(z.object({ id: idSchema, mode: modeSchema }));
export type SetMode = z.TypeOf<typeof setModeSchema>;
