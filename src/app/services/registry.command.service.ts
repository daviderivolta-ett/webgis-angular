/* Dependencies */
import { inject, Injectable, Injector, Type } from '@angular/core'

/* Models */
import { Command } from '../models'

/* Services */
import { PlatformsCommandService } from './command.platforms.service'
import { WMSCommandService } from './command.wms.service'
import { PolygonsCommandService } from './command.polygons.service'

/* Service */ 
@Injectable({
  providedIn: 'root'
})
export class CommandsRegistryService {
  private injector = inject(Injector);

  static commands: Map<string, Type<Command>> = new Map<string, Type<Command>>([
    ['platforms', PlatformsCommandService],
    ['wms', WMSCommandService],
    ['polygons', PolygonsCommandService]
  ]);

  public getCommand(key: string): Command | null {
    const command: Type<Command> | undefined = CommandsRegistryService.commands.get(key);
    return command ? this.injector.get(command) : null;
  }
}