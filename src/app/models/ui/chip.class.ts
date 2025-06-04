export class Chip {
    public id: string;
    public label?: string;
    public icon?: string;

    constructor(id: string, label?: string, icon?: string) {
        this.id = id;
        this.label = label;
        this.icon = icon;
    }
}