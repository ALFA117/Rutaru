"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, loginDemo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_USERS, DEMO_PASSWORD } from "@/lib/auth/demo-users";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Iniciar sesión
            </CardTitle>
            <CardDescription>pocas rutas, todas buenas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {state?.error && (
                <p role="alert" className="text-sm text-destructive">
                  {state.error}
                </p>
              )}
              <Button type="submit" disabled={pending} className="mt-2">
                {pending ? "Entrando…" : "Entrar"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="underline">
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle className="text-lg">🧪 Cuentas demo para pruebas</CardTitle>
            <CardDescription>
              Misma contraseña para los 5 roles — entra con un clic o copia las
              credenciales.{" "}
              <Link href="/guia-de-pruebas" className="underline">
                Ver guía de pruebas
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3 text-sm">
              {DEMO_USERS.map((u) => (
                <li
                  key={u.email}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{u.role}</span>
                    <code className="text-xs text-muted-foreground">
                      {u.email}
                    </code>
                  </div>
                  <form action={loginDemo}>
                    <input type="hidden" name="email" value={u.email} />
                    <Button type="submit" size="sm" variant="outline">
                      Entrar como {u.role}
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              Contraseña (si prefieres entrar manualmente):{" "}
              <code className="rounded bg-background px-2 py-1 text-xs">
                {DEMO_PASSWORD}
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
