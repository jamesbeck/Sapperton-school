import type { GlobalConfig } from "payload";
export const ClubInformation: GlobalConfig = {
  slug: "clubInformation",
  label: "Club booking information",
  access: { read: () => true },
  fields: [
    { name: "bookingPolicy", type: "textarea", label: "Shared booking policy" },
    { name: "paymentPlanEmail", type: "email", label: "Payment plan contact" },
  ],
};
