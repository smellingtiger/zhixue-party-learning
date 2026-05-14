export const checkPermission = (user: any, requiredPermission: string) => {
  return user.role === 'admin' || (user.permissions && user.permissions.includes(requiredPermission));
};

export const checkRole = (user: any, requiredRole: string) => {
  return user.role === requiredRole;
};