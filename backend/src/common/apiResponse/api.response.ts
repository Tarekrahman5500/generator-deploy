// import { HttpException, HttpStatus } from '@nestjs/common';

export type SendSuccessParams<T> = {
  statusCode: number;
  payload: { [key: string]: T };
};

// export type ErrorType<T extends object = {}> = {
//   name: string;
//   message: string;
//   payload: { [key: string]: T };
// };

// type SendErrorParams = {
//   message: string;
//   errors?: ErrorType;
// };

export const apiResponse = <T>({
  statusCode,
  payload = {},
}: SendSuccessParams<T>) => {
  return {
    statusCode,
    ...payload,
  };
};

// export const apiError = ({
//   message,
//   errors,
//   status = HttpStatus.BAD_REQUEST,
// }: SendErrorParams & { status?: number }) => {
//   throw new HttpException(
//     {
//       success: false,
//       message,
//       errors: errors
//         ? {
//             name: errors.name ?? 'Error',
//             message: errors.message ?? message ?? 'An error occurred',
//             ...(errors.payload ?? ''),
//           }
//         : null,
//     },
//     status,
//   );
// };
