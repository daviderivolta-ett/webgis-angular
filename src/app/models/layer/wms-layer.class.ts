import { Layer } from './layer.class';

export class WMSLayer extends Layer {
    public layers: string;
    public format: string;
    public version: string;
    public srs: string;
    public styles?: string;
    public transparent?: boolean;

    constructor(
        id: string,
        layerType: string,
        layers: string,
        format: string,
        version: string,
        srs: string,
        label?: string
    ) {
        super(id, layerType, label);
        this.layers = layers;
        this.format = format;
        this.version = version;
        this.srs = srs;
    }

    static createFromObject(object: any): WMSLayer {
        const layer: WMSLayer = new WMSLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['layerType'] === 'string' && object['layerType']) || '',
            (typeof object['layers'] === 'string' && object['layers']) || '',
            (typeof object['format'] === 'string' && object['format']) || 'image/png',
            (typeof object['version'] === 'string' && object['version']) || '1.1.1',
            (typeof object['srs'] === 'string' && object['srs']) || 'EPSG:3857',
          );
      
          if (typeof object['styles'] === 'string') layer.styles = object['styles'];
          if (typeof object['transparent'] === 'boolean') layer.transparent = object['transparent'];
          if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
      
          return layer;
    }

    static isWMSLayer(object: any): object is WMSLayer {
        return (
            object &&
            typeof object === 'object' &&
            typeof object.id === 'string' &&
            typeof object.layers === 'string' &&
            typeof object.format === 'string' &&
            typeof object.version === 'string' &&
            typeof object.srs === 'string'
        );
    }    
}