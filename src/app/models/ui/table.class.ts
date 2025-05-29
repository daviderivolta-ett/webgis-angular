export class Table {
    public header: string[] = [];
    public body: [string, any][][] = [];

    constructor() { }

    static createTableFromArray(data: Object[]): Table {
        return Table.generateTableStructure(data);
    }

    static generateTableStructure(data: Object[]): Table {
        const table = new Table();
        table.header = Table.extractHeaderKeys(data);
        table.body = Table.convertRowsToKeyValueArrays(Table.normalizeDataToMap(data, table.header));
        return table;
    }

    static extractHeaderKeys(data: Object[]): string[] {
        return [...new Set(data.flatMap((d: Object) => Object.keys(d)))];
    }

    static normalizeDataToMap(data: Object[], headerKeys: string[]): Map<string, any>[] {
        return data.map((d: Record<string, any>) => {
            const row: Map<string, any> = new Map<string, any>();

            headerKeys.forEach((k: string) => {
                row.set(k, Object.prototype.hasOwnProperty.call(d, k) ? d[k] : '-');
            });

            return row;
        });
    }

    static convertRowsToKeyValueArrays(data: Map<string, any>[]): [string, any][][] {
        return data.map(rowMap => Array.from(rowMap.entries()));
    }

    public sortTableData(key: string, direction: 'asc' | 'desc' | 'none'): Table {
        const table = this.cloneTable();

        if (direction === 'none') {
            return table;
        }

        const columnIndex: number = this.header.indexOf(key);
        if (columnIndex === -1) {
            return table;
        }

        const sortedBody: [string, any][][] = [...this.body].sort((a, b) => {
            const aValue = a[columnIndex]?.[1];
            const bValue = b[columnIndex]?.[1];

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        table.body = [...sortedBody];
        table.header = [...this.header];
        
        return table;
    }

    public cloneTable(): Table {
        const table = new Table();
        table.header = [...this.header];
        table.body = [...this.body];
        return table;
    }
}