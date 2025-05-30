export class TreeNode {
    public id: string;
    public label?: string;
    public iconUrl?: string;
    public options?: TreeNode[];

    constructor(id: string) {
        this.id = id;
    }

    static createFromObject(object: any): TreeNode {       
        if (!object || !object['id']) {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        const node: TreeNode = new TreeNode(object['id']);

        if ('label' in object && typeof object['label'] === 'string') node.label = object['label'];
        if ('iconUrl' in object && typeof object['iconUrl'] === 'string') node.iconUrl = object['iconUrl'];
        // if ('maxSelections' in object && typeof object['maxSelections'] === 'number') node.maxSelections = object['maxSelections'];
        // if ('action' in object && typeof object['action'] === 'string') node.action = object['action'];
        // if (object['action'] && typeof object['action'] === 'object') {
        //     const { name, params } = object['action'];
        //     if (typeof name === 'string') {
        //         node.action = {
        //             name,
        //             params: params ?? {}
        //         };
        //     }
        // }
        if ('options' in object && Array.isArray(object['options'])) node.options = object['options'].map((c: any) => TreeNode.createFromObject(c));

        return node;
    }
}