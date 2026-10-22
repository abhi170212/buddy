export const UserRoles = {
  STUDENT: 'student',
  MENTOR: 'mentor',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const VALID_ROLES: UserRole[] = [UserRoles.STUDENT, UserRoles.MENTOR];
