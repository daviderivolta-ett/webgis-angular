// Libraries
import { Injectable, Injector, Type } from '@angular/core';

// Models
import { Command } from '../models';
import { GetStationsCommandService } from './get-stations.command.service';
import { GetWMSCommandService } from './get-wms.command.service';

// Service
@Injectable({
  providedIn: 'root'
})
export class CommandsRegistryService {
  static commands: Map<string, Type<Command>> = new Map<string, Type<Command>>([
    ['getStations', GetStationsCommandService],
    ['getWms', GetWMSCommandService]
  ]);

  constructor(private injector: Injector) { }

  public getCommand(key: string): Command | null {
    const command: Type<Command> | undefined = CommandsRegistryService.commands.get(key);
    return command ? this.injector.get(command) : null;
  }
}