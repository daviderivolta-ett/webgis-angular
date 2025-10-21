// Libraries
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnackbarContainerComponent } from "./components";

// Component
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SnackbarContainerComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'omirl';
}