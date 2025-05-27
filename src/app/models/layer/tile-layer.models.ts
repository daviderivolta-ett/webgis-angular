import { Layer } from './layer.model';

export interface TileLayer extends Layer {
    url: string;
    attribution: string;
}