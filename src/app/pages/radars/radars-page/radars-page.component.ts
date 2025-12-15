/** Libraries */
import { Component, effect, ViewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

/** Services */
import { AuthService } from '../../../services';

/** Models */
import { RadarConfig, RadarConfigGroup, RadarConfigGroupToTreeNodeAdapter, TreeNode } from '../../../models';

/** Components */
import { HeaderComponent, SidebarComponent, ToggleComponent } from '../../../components';

/** Component */
@Component({
  selector: 'app-radars-page',
  imports: [
    /** Components */
    HeaderComponent,
    SidebarComponent,
    ToggleComponent,
    /**Directives */
    RouterLink,
    NgTemplateOutlet,
    RouterLinkActive
],
  templateUrl: './radars-page.component.html',
  styleUrl: './radars-page.component.scss'
})
export class RadarsPageComponent {
  /** User Interface */
  public navGroups: TreeNode[] = [];
  public config: RadarConfig | undefined;

  /** Data */
  public user: Record<string, any> | null = null;
  private _radarConfigGroups: RadarConfigGroup[] = [];

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    /** Resolvers */
    this._radarConfigGroups = this.route.snapshot.data['radarConfigGroups'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    this.navGroups = this._radarConfigGroups.map((g: RadarConfigGroup) => RadarConfigGroupToTreeNodeAdapter.convert(g));
    this.route.paramMap.subscribe(() => {
      const param: string | null = this.route.snapshot.paramMap.get('id');
      if (param) this._init(param);
    });
  }

  /** Methods */
  private async _init(id: string): Promise<void> {
    if (this._sidebar) this._sidebar.toggleSidebar(false);
    this.config = this._initConfig(id);
    if (!this.config) return;
    console.log(this.config);
  }

  private _initConfig(id: string): RadarConfig | undefined {
    const config = this._radarConfigGroups
      .map((g: RadarConfigGroup) => g.getRadarConfig(id))
      .find((g) => g !== undefined);
    if (!config) {
      this._radarConfigGroups.length > 0 ? this.router.navigateByUrl(`/radar/${this._radarConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
  }
}