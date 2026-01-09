/** Libraries */
import { Component, effect, ViewChild } from '@angular/core';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

/** Services */
import { AuthService } from '../../../services';

/** Models */
import { RadarConfig, RadarConfigGroup, RadarConfigGroupToTreeNodeAdapter, TreeNode, User } from '../../../models';

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
    RouterLinkActive,
    /** Pipes */
    TitleCasePipe
  ],
  templateUrl: './radars-page.component.html',
  styleUrl: './radars-page.component.scss'
})
export class RadarsPageComponent {
  /** User Interface */
  public navGroups: TreeNode[] = [];
  public config: RadarConfig | undefined;

  /** Data */
  public user: User | null = null;
  private _radarConfigGroups: RadarConfigGroup[] = [];
  public pageTitle: string = '';

  /** References */
  @ViewChild('sidebar') _sidebar!: SidebarComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    /** Resolvers */
    this._radarConfigGroups = this.route.snapshot.data['radarConfigGroups'];
    this.pageTitle = this.route.snapshot.data['type'];

    /** Effetcs */
    effect(() => {
      this.user = this.authService.user();
    });
  }

  /** Component lifecycle */
  public ngOnInit(): void {
    const configGroup: RadarConfigGroup | undefined = this._initConfigGroup(this.pageTitle ?? 'radar');
    if (!configGroup || !configGroup.options.every((c: RadarConfig | RadarConfigGroup) => c instanceof RadarConfigGroup)) return;

    this.navGroups = configGroup.options.map((g: RadarConfigGroup) => RadarConfigGroupToTreeNodeAdapter.convert(g));
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

  private _initConfigGroup(id: string): RadarConfigGroup | undefined {
    const config: RadarConfigGroup | undefined = this._radarConfigGroups.find(g => g.id === id);

    if (!config) {
      this._radarConfigGroups.length > 0 ? this.router.navigateByUrl(`/${id}/${this._radarConfigGroups[0].options[0].id}`) : '';
      return undefined;
    }
    return config;
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