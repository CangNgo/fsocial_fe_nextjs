import type { ProfileFollower } from "./profile-tabs";

export interface ProfileType {
  bio: string;
  background: string;
  avatar: string;
  displayName: string;
  followers: ProfileFollower[];
  relationship: boolean;
}
