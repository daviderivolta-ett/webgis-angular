import { TreeNode } from './tree-node.class';

export class GroupedCheckboxItem extends TreeNode {
    public maxSelections?: number;
    public isChecked?: boolean;
    public isDisabled?: boolean;
    public action?: any;
    public declare options?: GroupedCheckboxItem[];

    constructor(id: string) {
        super(id);
    }

    static override createFromObject(object: any): GroupedCheckboxItem {
        if (!object || !object['id']) {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        const item = new GroupedCheckboxItem(object['id']);

        if ('label' in object && typeof object['label'] === 'string') item.label = object['label'];
        if ('iconUrl' in object && typeof object['iconUrl'] === 'string') item.iconUrl = object['iconUrl'];
        if ('action' in object) item.action = { ...object['action'] };
        if ('maxSelections' in object && typeof object['maxSelections'] === 'number') item.maxSelections = object['maxSelections'];
        if ('options' in object && Array.isArray(object['options'])) {
            item.options = object['options'].map((c: any) => GroupedCheckboxItem.createFromObject(c));
        } else {
            item.isChecked = item['isChecked'] || false;
            item.isDisabled = item['isDisabled'] || false;
        }

        return item;
    }

    public getNestedCheckbox(id: string, group: GroupedCheckboxItem = this): GroupedCheckboxItem | undefined {
        if (group.id === id) return group;
        if (group.options) {
            for (const child of group.options) {
                const found: GroupedCheckboxItem | undefined = this.getNestedCheckbox(id, child);
                if (found) return found;
            }
        }
        return undefined;
    }

}