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
        if ('options' in object && Array.isArray(object['options'])) node.options = object['options'].map((c: any) => TreeNode.createFromObject(c));

        return node;
    }
}