import { z } from 'zod';
import * as dotenv from 'dotenv';
import { DevelopmentTypeEnum } from '../common/enums';

dotenv.config({
  path: '.env.development',
});

// 🔹 Reusable validators
const numericString = z
  .string()
  .regex(/^\d+$/, { message: 'Must be a number string' });
const nonEmptyString = z.string().nonempty();
const durationString = z.string().regex(/^\d+$/).transform(Number);

// 🔹 Main environment schema
export const environmentSchema = z.object({
  NODE_ENV: z
    .enum([...Object.values(DevelopmentTypeEnum)])
    .default(DevelopmentTypeEnum.DEVELOPMENT),

  PORT: numericString.transform(Number).default(5000),

  DATABASE_USERNAME: nonEmptyString,
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: nonEmptyString,
  DATABASE_HOST: nonEmptyString,
  DATABASE_PORT: numericString.transform(Number).default(5432),
  DATABASE_DIALECT: z.enum(['mysql']).default('mysql'),

  JWT_ACCESS_SECRET: nonEmptyString,
  JWT_REFRESH_SECRET: nonEmptyString,

  JWT_ACCESS_EXPIRES_IN: durationString.default(900), // 15 min
  JWT_REFRESH_EXPIRES_IN: durationString.default(10080), // 7 d

  // email
  SMTP_SERVICE: z.string().min(1, 'SMTP service is required'),
  SMTP_HOST: z.string().min(1, 'SMTP host is required'),
  SMTP_PORT: z.coerce
    .number()
    .int()
    .positive()
    .lte(65535, 'Port must be between 1 and 65535'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP password is required'),
  SMTP_MAIL: z.email('Invalid email address'),

  // opt
  OTP_EXPIRE_TIME: durationString.transform(Number),
});

// Parse and validate environment variables
// ✅ Parse & validate environment
const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid environment configuration:');
  console.error(parsed.error.message);
  // Force immediate exit with non-zero code
  process.exitCode = 1;
  throw new Error('Invalid environment variables. See logs above.');
}

export const envVariables = parsed.data;
