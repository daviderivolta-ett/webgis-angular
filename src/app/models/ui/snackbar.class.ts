export class Snackbar {
    public id: string;
    public text: string;
    public type: 'success' | 'error' | 'loader';
    public isAutoDismissed: boolean;

    constructor(text: string, type: 'success' | 'error' | 'loader', isAutoDismissed: boolean = false) {
        this.id = `snackbar_${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
        this.text = text;
        this.type = type;
        this.isAutoDismissed = isAutoDismissed;
    }
}