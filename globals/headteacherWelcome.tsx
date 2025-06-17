import { GlobalConfig } from "payload";

export const HeadteacherWelcome: GlobalConfig = {
  slug: "headteacher-welcome",
  label: "Headteacher's Welcome",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "jobTitle",
      type: "text",
      required: true,
    },
    {
      name: "body",
      type: "textarea",
      required: true,
    },
    {
      name: "quote",
      type: "text",
      required: true,
    },
  ],
};
