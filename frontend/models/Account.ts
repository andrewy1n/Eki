import { Stampbook } from "./Stampbook";

export interface CreateAccountData {
    name: string;
    password: string;
    email: string;
    profile_photo?: string | null;
}

export interface UpdateAccountData {
    bio: string | null;
    profile_photo: string | null;
}

export interface AccountData {
    display_name: string;
    email: string;
    bio?: string;
    profile_photo?: string;
    books?: Stampbook[]
}