export interface WMSLayerParams {
    layers: string;
    format: string;
    version: string;
    srs: string;
    styles?: string;
    transparent?: boolean;
}