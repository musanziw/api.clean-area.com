import { RolesBuilder } from 'nest-access-control';
import { Roles } from './enums/roles';

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

RBAC_POLICY.grant(Roles.ADMIN)
  .read('roles')
  .create('roles')
  .update('roles')
  .delete('roles')
  .read('users')
  .create('users')
  .update('users')
  .delete('users');
