import { z } from "zod";

export const UserFollowSchema = z.object({
    id: z.string(),
    followerUserId: z.string(),
    followingUserId: z.string(),
    createdAt: z.string(),
});