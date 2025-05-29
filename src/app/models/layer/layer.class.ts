export abstract class Layer {
    id: string;
    label?: string;

    constructor(id: string, label?: string) {
        this.id = id;
        this.label = label;
    }
}