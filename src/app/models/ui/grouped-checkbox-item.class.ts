import { TreeNode } from './tree-node.class';

export class GroupedCheckboxItem extends TreeNode {
    public maxSelections?: number;
    public isChecked?: boolean;
    public isDisabled?: boolean;
    public isVisible?: boolean;
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
        }

        item.isChecked = object['isChecked'] || false;
        item.isDisabled = object['isDisabled'] || false;
        item.isVisible = object['isVisible'] || false;
        
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

    public checkNestedCheckbox(ids: string[], group: GroupedCheckboxItem = this): GroupedCheckboxItem {
        const cloned: GroupedCheckboxItem = group.clone();

        cloned.isChecked = ids.includes(cloned.id);
        cloned.isDisabled = false;

        if (cloned.options) {
            cloned.options = cloned.options.map(child => this.checkNestedCheckbox(ids, child));
        }
       
        return cloned;
    }

    public toggleNestedCheckbox(areDisabled: boolean, group: GroupedCheckboxItem = this): GroupedCheckboxItem {
        const cloned: GroupedCheckboxItem = group.clone();

        cloned.isDisabled = areDisabled;

        if (cloned.options) {
            cloned.options = cloned.options.map(child => this.toggleNestedCheckbox(areDisabled, child));
        }

        return cloned;
    }

    public visibleNestedCheckbox(ids: string[], group: GroupedCheckboxItem = this): GroupedCheckboxItem {
        const cloned: GroupedCheckboxItem = group.clone();
       
        cloned.isVisible = ids.includes(cloned.id);

        if (cloned.options) {
            cloned.options = cloned.options.map(child => this.visibleNestedCheckbox(ids, child));
        }

        return cloned;
    }

    public clone(): GroupedCheckboxItem {
        const cloned = new GroupedCheckboxItem(this.id);
        cloned.label = this.label;
        cloned.iconUrl = this.iconUrl;
        cloned.action = this.action ? { ...this.action } : undefined;
        cloned.maxSelections = this.maxSelections;
        cloned.isChecked = this.isChecked;
        cloned.isDisabled = this.isDisabled;
        cloned.isVisible = this.isVisible;
        cloned.options = this.options?.map(opt => opt.clone());
        return cloned;
    }

}