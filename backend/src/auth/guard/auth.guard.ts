import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorator';
import { ACCESS_JWT } from '../provider';
import { JwtPayload } from 'src/common/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_JWT)
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip guard if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const auth = request.headers.authorization;
    if (!auth) throw new UnauthorizedException('Authentication token required');

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid authentication header');

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // attach typed payload
      request.user = payload as JwtPayload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token', err);
    }
  }
}
