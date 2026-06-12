export class CreateUserDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: 'ADMIN' | 'SELLER' | 'TECHNICIAN' | 'CLIENT';
}
