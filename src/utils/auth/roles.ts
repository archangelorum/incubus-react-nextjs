import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { NextRequest } from "next/server";

export type Role = PlatformStaffRole | PublisherStaffRole;

export const hasAnyRole = (userRoles: Role[], required: Role[]): boolean => {
  return required.some(role => userRoles.includes(role));
};

export const hasAllRoles = (userRoles: Role[], required: Role[]): boolean => {
  return required.every(role => userRoles.includes(role));
};

export const getRolesFromRequest = (request: NextRequest): Role[] => {
  const header = request.headers.get('x-user-roles');
  try {
    return header ? JSON.parse(header) : [];
  } catch (e) {
    return [];
  }
};

// Utility for API route authorization
export const validateRoles = (request: NextRequest, requiredRoles: Role[], checkType: 'any' | 'all' = 'any') => {
  const userRoles = getRolesFromRequest(request);
  
  if (
    (checkType === 'any' && !hasAnyRole(userRoles, requiredRoles)) ||
    (checkType === 'all' && !hasAllRoles(userRoles, requiredRoles))
  ) {
    throw new Error('Insufficient permissions');
  }
  
  return userRoles;
};