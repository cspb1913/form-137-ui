import { canAccessDashboard, isAdmin, isRequester } from '@/lib/auth-utils'
import type { UserWithRoles } from '@/types/user'

describe('RBAC Role Access Improvements', () => {
  const adminUser: UserWithRoles = {
    sub: 'auth0|admin',
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['Admin'],
  }

  const requesterUser: UserWithRoles = {
    sub: 'auth0|requester',
    name: 'Requester User',
    email: 'requester@example.com',
    roles: ['Requester'],
  }

  const multiRoleUser: UserWithRoles = {
    sub: 'auth0|multi',
    name: 'Multi Role User',
    email: 'multi@example.com',
    roles: ['Admin', 'Requester'],
  }

  describe('Dashboard Access Control', () => {
    it('allows admin users to access dashboard', () => {
      expect(canAccessDashboard(adminUser)).toBe(true)
    })

    it('allows requester users to access dashboard', () => {
      expect(canAccessDashboard(requesterUser)).toBe(true)
    })

    it('allows multi-role users to access dashboard', () => {
      expect(canAccessDashboard(multiRoleUser)).toBe(true)
    })

    it('denies access to users with no roles', () => {
      const noRoleUser: UserWithRoles = {
        sub: 'auth0|noroles',
        name: 'No Role User',
        email: 'noroles@example.com',
        roles: [],
      }
      expect(canAccessDashboard(noRoleUser)).toBe(false)
    })
  })

  describe('Role Detection', () => {
    it('correctly identifies admin users', () => {
      expect(isAdmin(adminUser)).toBe(true)
      expect(isAdmin(multiRoleUser)).toBe(true)
      expect(isAdmin(requesterUser)).toBe(false)
    })

    it('correctly identifies requester users', () => {
      expect(isRequester(requesterUser)).toBe(true)
      expect(isRequester(multiRoleUser)).toBe(true)
      expect(isRequester(adminUser)).toBe(false)
    })
  })
})