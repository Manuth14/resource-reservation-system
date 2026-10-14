import { db } from "@/lib/db";
import { ValidationError } from "@/lib/errors";

export const listResources = () =>
    db.resource.findMany({ include: { type: true }, orderBy: [{ is_active: "desc" }, { name: "asc" }] });

export const listActiveResources = () =>
    db.resource.findMany({ where: { is_active: true }, orderBy: { name: "asc" } });

export const listTypes = () => db.resourceType.findMany({ orderBy: { name: "asc" } });

export async function createResource(input: { name: string; typeId: string; location: string; capacity: number | null }) {
  if (!input.name) throw new ValidationError("Please enter a name.");
  if (!input.typeId) throw new ValidationError("Please choose a type.");
  if (input.capacity !== null && (!Number.isInteger(input.capacity) || input.capacity < 1)) throw new ValidationError("Capacity must be a positive whole number.");
  return db.resource.create({
    data: { name: input.name, type_id: input.typeId, location: input.location || null, capacity: input.capacity },
  });
}

export async function setResourceActive(id: string, active: boolean) {
  return db.resource.update({ where: { id }, data: { is_active: active } });
}

export const listTypesWithCounts = () =>
    db.resourceType.findMany({ include: { _count: { select: { resources: true } } }, orderBy: { name: "asc" } });

export async function addType(name: string) {
  if (!name) throw new ValidationError("Please enter a name.");
  if (await db.resourceType.findUnique({ where: { name } })) throw new ValidationError("That type already exists.");
  return db.resourceType.create({ data: { name } });
}

export async function deleteType(id: string) {
  const used = await db.resource.count({ where: { type_id: id } });
  if (used > 0) throw new ValidationError("This type is used by resources, so it cannot be deleted.");
  return db.resourceType.delete({ where: { id } });
}

export const getResource = (id: string) => db.resource.findUnique({ where: { id }, include: { type: true } }).catch(() => null);