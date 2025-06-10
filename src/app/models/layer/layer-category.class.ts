export class LayerCategory {
    public id: string;
    public maxNumber: number;
    public incompatibleWith: string[];

    constructor(id: string, maxNumber: number, incompatibleWith: string[]) {
        this.id = id;
        this.maxNumber = maxNumber;
        this.incompatibleWith = incompatibleWith;
    }

    static createFromObject(object: any): LayerCategory {
        return new LayerCategory(
            object['id'] ?? '',
            object['maxNumber'] ?? -1,
            (object['incompatibleWith'] && Array.isArray(object['incompatibleWith'])) ?
                object['incompatibleWith'].filter((c: any) => typeof c === 'string') :
                []
        )
    }
}