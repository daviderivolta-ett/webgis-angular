/** Dependencies */
import { Injectable, Injector, Type } from '@angular/core'

/** Models */
import { Command } from '../models'

/** Services */
import { HydroCommandService } from './command.hydro.service'
import { LightningCommandService } from './command.lightning.service'
import { PlatformsCommandService } from './command.platforms.service'
import { WMSCommandService } from './command.wms.service'
import { PolygonsCommandService } from './command.polygons.service'

// Service
@Injectable({
  providedIn: 'root'
})
export class CommandsRegistryService {
  static commands: Map<string, Type<Command>> = new Map<string, Type<Command>>([    
    ['hydro', HydroCommandService],
    ['lightning', LightningCommandService],
    ['platforms', PlatformsCommandService],
    ['wms', WMSCommandService],
    ['polygons', PolygonsCommandService]
  ]);

  constructor(private injector: Injector) { }

  public getCommand(key: string): Command | null {
    const command: Type<Command> | undefined = CommandsRegistryService.commands.get(key);
    return command ? this.injector.get(command) : null;
  }
}