import { Expose } from 'class-transformer';
export class ProfileDto {

    @Expose()
    uuid: string;

    @Expose()
    phoneNumber: string;

    @Expose()
    email?: string;

    @Expose()
    firstName?: string;

    @Expose()
    lastName?: string;

    @Expose()
    age?: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}