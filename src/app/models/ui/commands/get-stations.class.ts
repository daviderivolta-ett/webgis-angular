import { Command } from './command.interface';

export class GetStationsCommand implements Command {
    public execute(params?: any): void {
        console.log('GET GEOJSON', params);
    }    
}