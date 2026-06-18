export function combineName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Returns "FirstName LastName" trimmed — matches legacy combineIntoDisplayName */
export function combineIntoDisplayName(firstName: string, lastName: string): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

/** Returns "FL" initials for avatar fallback — matches legacy combineIntoAvatarName */
export function combineIntoAvatarName(firstName: string, lastName: string): string {
  const f = (firstName ?? "").charAt(0).toUpperCase();
  const l = (lastName ?? "").charAt(0).toUpperCase();
  return `${f}${l}`;
}

/** Returns up to 2 initials extracted from a single combined display name */
export function getInitialsFromDisplayName(displayName: string): string {
  const parts = (displayName ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length <= 1) return first.charAt(0).toUpperCase();
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
