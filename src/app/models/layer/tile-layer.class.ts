import { Layer } from './layer.class';

export class TileLayer extends Layer {
    public url: string;
    public attribution: string;

    constructor(id: string, url: string, attribution: string, label?: string) {
        super(id, label);
        this.url = url;
        this.attribution = attribution;
    }

    static createFromObject(object: any): TileLayer {
        const layer: TileLayer = new TileLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['url'] === 'string' && object['url']) || '',
            (typeof object['attribution'] === 'string' && object['attribution']) || '',
          );
      
          if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
      
          return layer;
    }
}