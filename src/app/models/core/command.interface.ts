export interface Command {
    execute(params?: any): Promise<any>;
}