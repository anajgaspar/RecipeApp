import { ImageSourcePropType } from "react-native";

export type ProfileAvatarPreset = {
    id: string;
    url: ImageSourcePropType;
    backgroundColor: string;
};

export const PROFILE_AVATAR_PREFIX = "preset:";

export function toProfileAvatarDataUrl(presetId: string): string {
    return `${PROFILE_AVATAR_PREFIX}${presetId}`;
}

export function getProfileAvatarPreset(avatarDataUrl?: string | null): ProfileAvatarPreset | null {
    if (!avatarDataUrl || !avatarDataUrl.startsWith(PROFILE_AVATAR_PREFIX)) {
        return null;
    }

    const presetId = avatarDataUrl.slice(PROFILE_AVATAR_PREFIX.length);
    return PROFILE_AVATAR_PRESETS.find((preset) => preset.id === presetId) ?? null;
}

export const PROFILE_AVATAR_PRESETS: ProfileAvatarPreset[] = [
    {
        id: "white-brunette-man",
        url: require("@/src/assets/avatars/white-brunette-man.jpg"),
        backgroundColor: "#fff7ed",
    },
    {
        id: "white-brunette-woman",
        url: require("@/src/assets/avatars/white-brunette-woman.jpg"),
        backgroundColor: "#fff7ed",
    },
    {
        id: "white-blonde-man",
        url: require("@/src/assets/avatars/white-blonde-man.jpg"),
        backgroundColor: "#fff7ed",
    },
    {
        id: "white-blonde-woman",
        url: require("@/src/assets/avatars/white-blonde-woman.jpg"),
        backgroundColor: "#fff7ed",
    },
    {
        id: "black-brunette-man",
        url: require("@/src/assets/avatars/black-brunette-man.jpg"),
        backgroundColor: "#fff7ed",
    },
    {
        id: "black-brunette-woman",
        url: require("@/src/assets/avatars/black-brunette-woman.jpg"),
        backgroundColor: "#fff7ed",
    },
];