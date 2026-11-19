import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  audience: z.object({
    roles: z.array(z.string()).default([]),
    classIds: z.array(z.string().uuid()).default([]),
  }),
});
