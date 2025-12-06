import { ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MimeTypeValidator } from '../validators';

export const createDiskStorage = (filenamePrefix?: string) =>
  diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const prefix = filenamePrefix || file.fieldname;
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    },
  });

export const createFileValidator = (maxSizeMB: number, mimeTypes: string[]) =>
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: maxSizeMB * 1024 * 1024 }),
      new MimeTypeValidator({ mimeTypes }),
    ],
  });
