export function normalizeUserData(data) {
  if (!data) return null;
  return {
    id: data.id,
    email: data.email || '',
    username: data.username || '',
    firstName: data.first_name || data.firstName || '',
    lastName: data.last_name || data.lastName || '',
    name: data.name || '',
    role: data.role || '',
    bio: data.bio || '',
    profileImage: data.profile_picture || data.photo || data.profile || '',
    dateJoined: data.date_joined || data.dateJoined || '',
    isActive: data.is_active ?? data.isActive ?? true,
    socialLinks: data.social_links || data.socialLinks || {
      linkedin: '', github: '', twitter: '', website: '',
    },
  };
}

export function getDisplayName(user) {
  if (!user) return 'User';
  const normalized = user.firstName ? user : normalizeUserData(user);
  if (normalized.firstName && normalized.lastName) return `${normalized.firstName} ${normalized.lastName}`;
  if (normalized.firstName) return normalized.firstName;
  if (normalized.name) return normalized.name;
  if (normalized.username) return normalized.username;
  if (normalized.email) return normalized.email.split('@')[0];
  return 'User';
}

export function getUserInitials(user) {
  if (!user) return 'U';
  const normalized = user.firstName ? user : normalizeUserData(user);
  if (normalized.firstName && normalized.lastName) {
    return `${normalized.firstName[0]}${normalized.lastName[0]}`.toUpperCase();
  }
  if (normalized.firstName) return normalized.firstName[0].toUpperCase();
  if (normalized.name) return normalized.name[0].toUpperCase();
  if (normalized.username) return normalized.username[0].toUpperCase();
  return 'U';
}

export function getProfileImage(user) {
  if (!user) return '/placeholder-user.jpg';
  return user.profile_picture || user.photo || user.profile || user.profileImage || '/placeholder-user.jpg';
}
