import { redirect } from "next/navigation";
import { Waves } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loginAs } from "@/actions/auth.actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");

  const { error } = await searchParams;
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8">
      <span className="mb-5 grid size-11 place-items-center rounded-xl bg-brand text-ink">
        <Waves size={24} aria-hidden />
      </span>
      <h1 className="font-display text-2xl font-bold tracking-tight">Choose who you are</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Demo sign-in. Pick a user to continue.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          That user could not be found. Pick one from the list.
        </p>
      )}

      {users.length === 0 ? (
        <p className="text-sm text-muted">No users yet. Run the seed script: npx prisma db seed</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.id}>
              <form action={loginAs}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-left transition-colors hover:border-brand hover:bg-brand-tint"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                    {u.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{u.name}</span>
                    <span className="block truncate text-xs text-muted">{u.email}</span>
                  </span>
                  <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {u.role === "ADMIN" ? "Admin" : "Member"}
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
