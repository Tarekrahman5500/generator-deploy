import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdministratorModule } from './modules/administrator/administrator.module';
import { ContactFormModule } from './modules/contact-form/contact.form.module';
import typeorm from './config/typeorm';
import { configConstants, envConfiguration } from './config';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './error/allExceptionsFilter';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { SearchModule } from './modules/search/search.module';
import { EmailModule } from './modules/email/email.module';
import { BackgroundModule } from './modules/background/background.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm, envConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const options = configService.get<TypeOrmModuleOptions>(
          configConstants.TYPEORM,
        );
        if (!options) {
          throw new Error('TypeORM configuration is missing');
        }
        return options;
      },
    }),
    ProductModule,
    AdministratorModule,
    ContactFormModule,
    AuthModule,
    FileModule,
    SearchModule,
    EmailModule,
    BackgroundModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
