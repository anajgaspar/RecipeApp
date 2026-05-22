import { FollowRepository } from "../repositories/followRepository";
import { UserRepository } from "../repositories/userRepository";

type SocialConnectionUser = {
    id: string;
    name: string;
    avatarDataUrl?: string | null;
};

type SocialConnectionItem = {
    user: SocialConnectionUser;
    followedAt: string;
    isFollowingBack: boolean;
};

async function buildConnectionItems(userId: string, follows: { followerUserId: string; followingUserId: string; createdAt: string }[], targetField: "followerUserId" | "followingUserId"): Promise<SocialConnectionItem[]> {
    const connectedUserIds = follows
        .map((follow) => follow[targetField])
        .filter((connectedUserId) => connectedUserId !== userId);

    const [connectedUsers, reciprocalFollows] = await Promise.all([
        UserRepository.findByIds(connectedUserIds),
        FollowRepository.listFollowing(userId),
    ]);

    const reciprocalUserIds = new Set(reciprocalFollows.map((follow) => follow.followingUserId));
    const userMap = new Map(connectedUsers.map((user) => [user.id, user]));

    const items: SocialConnectionItem[] = [];

    for (const follow of follows) {
        const connectedUserId = follow[targetField];
        const user = userMap.get(connectedUserId);

        if (!user) {
            continue;
        }

        items.push({
            user: {
                id: user.id,
                name: user.name,
                avatarDataUrl: user.avatarDataUrl ?? null,
            },
            followedAt: follow.createdAt,
            isFollowingBack: reciprocalUserIds.has(user.id),
        });
    }

    return items.sort((left, right) => right.followedAt.localeCompare(left.followedAt));
}

export const FollowService = {
    async toggleFollow(followerUserId: string, targetUserId: string) {
        if (followerUserId === targetUserId) {
            throw new Error("Você não pode seguir a si mesmo.");
        }

        const targetUser = await UserRepository.findById(targetUserId);
        if (!targetUser) {
            throw new Error("Usuário não encontrado");
        }

        const existingFollow = await FollowRepository.findByUsers(followerUserId, targetUserId);

        if (existingFollow) {
            await FollowRepository.deleteByUsers(followerUserId, targetUserId);
            return { isFollowing: false };
        }

        const follow = await FollowRepository.create(followerUserId, targetUserId);
        return { isFollowing: true, follow };
    },

    async getFollowStatus(followerUserId: string, targetUserId: string) {
        const existingFollow = await FollowRepository.findByUsers(followerUserId, targetUserId);
        return { isFollowing: Boolean(existingFollow) };
    },

    async getSocialSummary(userId: string) {
        const [followers, following] = await Promise.all([
            FollowRepository.listFollowers(userId),
            FollowRepository.listFollowing(userId),
        ]);

        return {
            followersCount: followers.length,
            followingCount: following.length,
        };
    },

    async listFollowers(userId: string) {
        const followers = await FollowRepository.listFollowers(userId);
        return buildConnectionItems(userId, followers, "followerUserId");
    },

    async listFollowing(userId: string) {
        const following = await FollowRepository.listFollowing(userId);
        return buildConnectionItems(userId, following, "followingUserId");
    },
};