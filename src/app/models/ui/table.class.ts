export class Table {
    public header: string[] = [];
    public body: [string, any][][] = [];

    constructor() { }

    static createTableFromArray(data: Object[]): Table {
        return Table.generateTableStructure(data);
    }

    static generateTableStructure(data: Object[], primaryKey?: string): Table {
        const table = new Table();

        /** Header */
        let header = Table.extractHeaderKeys(data);
        if (primaryKey && header.includes(primaryKey)) {
            header = [primaryKey, ...header.filter((k: string) => k !== primaryKey)];
        }
        table.header = header;

        /** Body */
        const normalizedData: Map<string, any>[] = Table.normalizeDataToMap(data, header);
        const body: [string, any][][] = Table.convertRowsToKeyValueArrays(normalizedData);
        table.body = body.map((row: [string, any][]) => {
            if (!primaryKey) return row;

            const index: number = row.findIndex(([k]: string[]) => k === primaryKey);
            if (index === -1) return row;

            const [primaryEntry]: [string, any][] = row.splice(index, 1);
            return [primaryEntry, ...row];
        });

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

    public filterTableData(filters: Record<string, string>): Table {
        const table = this.cloneTable();

        table.body = table.body.filter((row: [string, any][]) => {
            return row.every(([key, value]: [string, any]) => {
                // Se il filtro per una chiave è vuoto o undefined, non filtriamo su quella chiave
                const filterValue = filters[key];
                if (!filterValue) return true; // Consideriamo un valore vuoto o undefined come "accettabile"

                // Filtro parziale (case-insensitive) per i valori stringa
                if (typeof value === 'string' && typeof filterValue === 'string') {
                    const matches: boolean = value.toLowerCase().includes(filterValue.toLowerCase());
                    return matches;
                }

                // Altrimenti confronto esatto
                const exactMatch = filterValue === value;
                return exactMatch;
            });
        });

        return table;
    }

    public cloneTable(): Table {
        const table = new Table();
        table.header = [...this.header];
        table.body = [...this.body];
        return table;
    }

    public extractAllValuesByKey(key: string): string[] {
        const values = this.body
            .flatMap((row) => row.filter(([k]) => k === key).map(([, v]) => v)).filter((k) => k !== null);

        return Array.from(new Set(values));
    }

}