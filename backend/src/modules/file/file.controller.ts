import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  HttpStatus,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileIdParamDto } from './dto';
import { createFileValidator, createDiskStorage } from 'src/common/functions';
import { apiResponse } from 'src/common/apiResponse/api.response';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: createDiskStorage() }))
  async imageUpload(
    @UploadedFile(
      createFileValidator(5, [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ]),
    )
    file: Express.Multer.File,
  ) {
    const response = await this.fileService.saveFileInfo(file);

    return apiResponse({
      statusCode: HttpStatus.ACCEPTED,
      payload: { response },
    });
  }

  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', { storage: createDiskStorage('pdf') }),
  )
  async pdfUpload(
    @UploadedFile(createFileValidator(10, ['application/pdf']))
    file: Express.Multer.File,
  ) {
    const response = await this.fileService.saveFileInfo(file);

    return apiResponse({
      statusCode: HttpStatus.ACCEPTED,
      payload: { response },
    });
  }

  @Get(':id')
  async getFile(@Param() params: FileIdParamDto) {
    const response = await this.fileService.findById(params.id);

    if (!response) {
      throw new NotFoundException(`File with ID ${params.id} not found`);
    }

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { response },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param() params: FileIdParamDto) {
    await this.fileService.deleteFileById(params.id);
  }

  @Get()
  async getFiles() {
    const files = await this.fileService.getAllFiles();

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { files },
    });
  }
}
