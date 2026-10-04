import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { punchUpReaction } from "./reactions.server";

export const makeComment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        reaction: z.string().trim().min(1).max(200),
        prompt: z.string().max(300),
        caption: z.string().max(200),
      })
      .parse(d)
  )
  .handler(({ data }) => punchUpReaction(data));
