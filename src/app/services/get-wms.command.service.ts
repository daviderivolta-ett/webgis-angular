// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command } from '../models';

// Service
@Injectable({
    providedIn: 'root'
})
export class GetWMSCommandService implements Command {
    public async execute(params?: any): Promise<any> {
        const { url, options } = params;

        console.log(url, options);        

        return null;
    }
}