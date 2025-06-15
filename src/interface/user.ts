export interface User{
    id : string;
    name : string;
    email : string;
    hashed_password ?: string;
    phone : string;
    verified? : boolean;
    createdAt?: Date;
    role?: string;    
}