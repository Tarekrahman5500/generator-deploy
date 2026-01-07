import { SetMetadata } from '@nestjs/common';
import { AdministratorRole } from 'src/common/enums';

export const ROLES_KEY = 'roles';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: AdministratorRole[]) =>
  SetMetadata(ROLES_KEY, roles);
