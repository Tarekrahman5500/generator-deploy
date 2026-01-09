import { JwtService } from '@nestjs/jwt';
import { envVariables } from '../../config';

export const ACCESS_JWT = 'ACCESS_JWT';

export const jwtProviders = [
  {
    provide: ACCESS_JWT,
    useFactory: () =>
      new JwtService({
        secret: envVariables.JWT_ACCESS_SECRET,
        signOptions: { expiresIn: envVariables.JWT_ACCESS_EXPIRES_IN },
      }),
  },
];
