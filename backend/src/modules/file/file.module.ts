import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/entities/file';
import { jwtProviders } from 'src/auth/provider';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  exports: [FileService],
  providers: [FileService, ...jwtProviders],
  controllers: [FileController],
})
export class FileModule {}
