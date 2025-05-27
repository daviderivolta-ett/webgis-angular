export interface AppConfig {
    baseUrl: string;
    restUrl?: string;
    geoServerUrl?: string;
}

export interface ConfigOption {
    id: string;
    label: string;
}

export interface LayerConfigOption extends ConfigOption {
    maxSelections?: number;
    iconUrl?: string;
    url?: string;
    options?: LayerConfigOption[];
}