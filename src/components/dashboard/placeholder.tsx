import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, type UserRole } from "@/lib/auth/roles";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function DashboardPlaceholder({
  role,
  profile,
}: {
  role: UserRole;
  profile: Profile;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        {ROLE_LABEL[role]}
      </span>
      <h1 className="font-heading text-3xl">
        Bienvenido, {profile.nombre ?? profile.email}
      </h1>
      <p className="text-muted-foreground">
        Tu dashboard de {ROLE_LABEL[role].toLowerCase()} llega en la Etapa 2
        (Inteligencia). Por ahora esto confirma que el login, el enrutamiento
        por rol y las políticas de RLS funcionan.
      </p>
      <form action={logout}>
        <Button variant="outline" type="submit">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
