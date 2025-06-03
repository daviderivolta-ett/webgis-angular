export abstract class Layer {
    id: string;
    layerType: string;
    label?: string;

    constructor(id: string, layerType: string, label?: string) {
        this.id = id;
        this.layerType = layerType;
        this.label = label;
    }
}