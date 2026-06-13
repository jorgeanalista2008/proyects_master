import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        role: {
            name: string;
            description: string | null;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        role: {
            id: string;
            name: string;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
        };
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
    }>;
}
