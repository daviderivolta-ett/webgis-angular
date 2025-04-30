// Libraries
import { Component, ViewChild } from '@angular/core';

// Components
import { HeaderComponent } from '../../../components/header/header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { MapComponent } from '../map/map.component';
import { PopUpMenuComponent } from "../../../components/pop-up-menu/pop-up-menu.component";
import { CheckboxGroupComponent } from "../../../components/checkbox-group/checkbox-group.component";

// Component
@Component({
  selector: 'app-data-page',
  imports: [
    HeaderComponent,
    SidebarComponent,
    MapComponent,
    PopUpMenuComponent,
    CheckboxGroupComponent
],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent {
  @ViewChild('sidebar') _sidebar!: SidebarComponent;
}