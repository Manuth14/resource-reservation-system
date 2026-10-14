import { requireAdmin } from "@/lib/auth";
import { listTypes } from "@/services/resource.service";
import ResourceForm from "@/components/resources/ResourceForm";

export default async function NewResourcePage() {
  await requireAdmin();
  const types = await listTypes();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">Add resource</h1>
      <ResourceForm types={types} />
    </div>
  );
}
