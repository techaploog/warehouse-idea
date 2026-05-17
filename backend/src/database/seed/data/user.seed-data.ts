import { TUserInsert } from "@/database/schema";

export const ADMIN_USER_PASSWORD = "admin123";

export function getAdminUserData(): TUserInsert {
  return {
    email: "SYSTEM_ADMIN",
    name: "System Admin",
    password: "admin1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
