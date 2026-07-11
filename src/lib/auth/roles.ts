import type { Database } from "@/types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export const ROLE_HOME: Record<UserRole, string> = {
  operador: "/operador",
  agencia: "/agencia",
  admin: "/admin",
  afiliado: "/afiliado",
  cliente: "/cliente",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  operador: "Operador",
  agencia: "Agencia",
  admin: "Admin",
  afiliado: "Afiliado",
  cliente: "Cliente",
};
