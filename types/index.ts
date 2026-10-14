export type Role = "ADMIN" | "MEMBER";

export function isRole(value: string): value is Role {
    return value === "ADMIN" || value === "MEMBER";
}