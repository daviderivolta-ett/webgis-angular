import { Layer } from './layer.model';

export interface WMSLayer extends Layer {
    layers: string;
    transparent: boolean;
    format: string;
    version: string;
    styles: string;
    srs: string;
}