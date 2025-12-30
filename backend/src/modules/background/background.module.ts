import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundEntity } from 'src/entities/background/background.entity';
import { FileEntity } from 'src/entities/file/file.entity';
import { BackgroundController } from './background.controller';
import { BackgroundService } from './background.service';
import { FileModule } from 'src/modules/file/file.module';
import { jwtProviders } from 'src/auth/provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([BackgroundEntity, FileEntity]),
    FileModule,
  ],
  controllers: [BackgroundController],
  providers: [BackgroundService, ...jwtProviders],
  exports: [BackgroundService],
})
export class BackgroundModule {}
