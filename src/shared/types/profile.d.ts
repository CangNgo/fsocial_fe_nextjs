export interface AccountResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  background?: string | null;
  role?: "USER" | "ADMIN";
  username?: string;
  email?: string;
  bio?: string;
  address?: string;
  dob?: string;
  gender?: number;
  displayName?: string;
  follower?: string[];
  following?: string[];
  isFollowing?: boolean;
  isPrivate?: boolean;
}
