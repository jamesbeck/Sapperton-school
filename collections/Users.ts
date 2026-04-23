import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 5 * 60 * 1000,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};
