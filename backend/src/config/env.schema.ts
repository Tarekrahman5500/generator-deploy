import 'dotenv/config';
import { z } from 'zod';
import { DevelopmentTypeEnum } from '../common/enums';

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
  DATABASE_PASSWORD: nonEmptyString,
  DATABASE_NAME: nonEmptyString,
  DATABASE_HOST: nonEmptyString,
  DATABASE_PORT: numericString.transform(Number).default(5432),
  DATABASE_DIALECT: z.enum(['mysql']).default('mysql'),

  JWT_ACCESS_SECRET: nonEmptyString,
  JWT_REFRESH_SECRET: nonEmptyString,

  JWT_ACCESS_EXPIRES_IN: durationString.default(900), // 15 min
  JWT_REFRESH_EXPIRES_IN: durationString.default(10080), // 7 d
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
