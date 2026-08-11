import { isUUID } from 'class-validator';
import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';

export const validateUUID = (id: string, model: string) => {
  if (!isUUID(id)) {
    throw new CustomError({
      statusCode: 400,
      message: `Invalid ${model} ID`,
      code: EErrorCode.VALIDATION_FAILED,
    });
  }
};
