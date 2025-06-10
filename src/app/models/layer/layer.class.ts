export abstract class Layer {
    id: string;
    layerType: string;
    layerCategory?: string;
    label?: string;
    iconUrl?: string;
    action?: any;

    constructor(
        id: string,
        layerType: string,
        layerCategory?: string,
        label?: string,
        iconUrl?: string
    ) {
        this.id = id;
        this.layerType = layerType;
        this.layerCategory = layerCategory;
        this.label = label;
        this.iconUrl = iconUrl;
    }
}