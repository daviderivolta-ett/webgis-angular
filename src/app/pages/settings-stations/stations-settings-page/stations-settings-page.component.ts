/** Libraries */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Models */
import { StationBase } from '../../../models';
import { HeaderComponent, SidebarComponent } from "../../../components";
import { SearchbarComponent } from "../../../components/searchbar/searchbar.component";

/** Component */
@Component({
  selector: 'app-stations-settings-page',
  imports: [HeaderComponent, SidebarComponent, SearchbarComponent],
  templateUrl: './stations-settings-page.component.html',
  styleUrl: './stations-settings-page.component.scss'
})
export class StationsSettingsPageComponent {
  /**
   * Class properties
   */

  /** Data */
  public stations: StationBase[]; // Recovered from route resolver in constructor
  public filteredStations: StationBase[] = [];

  /** Constructor */
  constructor(private route: ActivatedRoute) {
    this.stations = this.filteredStations = this.route.snapshot.data['stations'];
  }

  /** Component lifecycle */
  public async ngOnInit() {
    console.log(this.stations);
    // fetch('/mock_data/precipitation.geojson')
    //   .then((res: Response) => res.json())
    //   .then((data: GeoJSON.FeatureCollection) => {
    //     const sensors = ['pluvio', 'termo', 'idro', 'vento', 'igro', 'elio', 'radio', 'foglie', 'press', 'batt', 'boa', 'neve'];

    //     const stations = data.features.map((f: GeoJSON.Feature) => {
    //       const properties = { ...f.properties }
    //       const ranNum: number = Math.floor(Math.random() * sensors.length) + 1;          
    //       return {
    //         id: properties['shortCode'],
    //         lat: f.geometry.type === 'Point' ? f.geometry.coordinates[1] : undefined,
    //         lng: f.geometry.type === 'Point' ? f.geometry.coordinates[0] : undefined,
    //         name: properties['name'],
    //         city: properties['municipality'],
    //         alt: properties['alt'],
    //         sensors: sensors.slice(0, ranNum)
    //       }
    //     });

    //     console.log(JSON.stringify(stations));        
    //   })
  }

  /** Methods */
  public onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;  
    this.filteredStations = this.stations.filter((s: StationBase) => s.id.toLowerCase().includes(value.toLowerCase()));  
  }
}