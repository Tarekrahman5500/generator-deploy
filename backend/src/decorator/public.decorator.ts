import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Sets metadata indicating the route should be public
export const isPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
