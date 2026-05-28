import { Expose } from 'class-transformer';

export class BaseResponseDto<T> {
    @Expose()
    message: string;

    @Expose()
    statusCode: number;

    // The actual payload data returned by your controller
    @Expose()
    data: T;

    constructor(partial: Partial<BaseResponseDto<T>>) {
        Object.assign(this, partial);
    }
}