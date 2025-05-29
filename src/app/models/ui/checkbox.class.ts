export class Checkbox {
    public id: string;
    public label?: string;
    public iconUrl?: string;
    public maxSelections?: number;
    public options?: Checkbox[];
    public action?: { name: string, params: any };

    static actions: Map<string, any> = new Map<string, any>();

    constructor(id: string) {
        this.id = id;
    }

    static createFromObject(object: any): Checkbox {
        if (!object || !object['id']) {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        const checkbox: Checkbox = new Checkbox(object['id']);

        if ('label' in object && typeof object['label'] === 'string') checkbox.label = object['label'];
        if ('iconUrl' in object && typeof object['iconUrl'] === 'string') checkbox.iconUrl = object['iconUrl'];
        if ('maxSelections' in object && typeof object['maxSelections'] === 'number') checkbox.maxSelections = object['maxSelections'];
        if (object['action'] && typeof object['action'] === 'object') {
            const { name, params } = object['action'];
            if (typeof name === 'string') {
                checkbox.action = {
                    name,
                    params: params ?? {}
                };
            }
        }
        if ('options' in object && Array.isArray(object['options'])) checkbox.options = object['options'].map((c: any) => Checkbox.createFromObject(c));

        return checkbox;
    }

    static getCheckboxById(id: string, checkboxes: Checkbox[]): Checkbox | undefined {
        for (const checkbox of checkboxes) {
            if (checkbox.id === id) return checkbox;

            if (checkbox.options) {
                const found = Checkbox.getCheckboxById(id, checkbox.options);
                if (found) return found;
            }
        }

        return undefined;
    }

    public async triggerAction(): Promise<any> {
        if (!this.action) return;
        console.log(this.action.name);

        // const command: Command | undefined = Checkbox.actions.get(this.action.name);      
        // if (command) {
        //     if (this.action.params) return command.execute(this.action.params);
        //     else return command.execute();
        // }
    }
}