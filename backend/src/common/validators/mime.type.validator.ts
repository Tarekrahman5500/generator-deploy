import { FileValidator } from '@nestjs/common';

export interface MimeTypeValidatorOptions {
  mimeTypes: string[];
}

export class MimeTypeValidator extends FileValidator<MimeTypeValidatorOptions> {
  buildErrorMessage(): string {
    return `Validation failed. Allowed MIME types: ${this.validationOptions.mimeTypes.join(', ')}`;
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    return this.validationOptions.mimeTypes.includes(file.mimetype);
  }
}
