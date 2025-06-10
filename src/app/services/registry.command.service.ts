/** Libraries */
import { Injectable, Injector, Type } from '@angular/core';

/** Models */
import { Command } from '../models';

/** Services */
import { GetAndRenderStationsCommandService } from './get-stations.command.service';
import { GetWMSCommandService } from './get-wms.command.service';
import { ClusterStationsService } from './cluster-stations.command.service';

// Service
@Injectable({
  providedIn: 'root'
})
export class CommandsRegistryService {
  static commands: Map<string, Type<Command>> = new Map<string, Type<Command>>([
    ['getStations', GetAndRenderStationsCommandService],
    ['getWms', GetWMSCommandService],
    ['clusterStations', ClusterStationsService]
  ]);

  constructor(private injector: Injector) { }

  public getCommand(key: string): Command | null {
    const command: Type<Command> | undefined = CommandsRegistryService.commands.get(key);
    return command ? this.injector.get(command) : null;
  }
}