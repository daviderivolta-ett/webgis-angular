export class User {
    public email: string;
    public roles: string[];

    constructor(
        email: string,
        roles: string[] = []
    ) {
        this.email = email;
        this.roles = roles;
    }
}