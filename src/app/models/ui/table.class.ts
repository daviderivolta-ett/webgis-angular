export class Table2 {
    public header: string[] = [];
    public body: any[][] = [];

    constructor() { }

    static createTableFromArray(data: Object[]): Table2 {
        return Table2.generateTableStructure(data);
    }

    static generateTableStructure(data: Object[], primaryKey?: string, keysOrder?: string[], hiddenKey?: string): Table2 {
        const table = new Table2();

        /** Header */
        let header = Table2.extractHeaderKeys(data);
        if (primaryKey && header.includes(primaryKey)) {
            header = [primaryKey, ...header.filter((k: string) => k !== primaryKey)];
        }
        if (keysOrder && keysOrder.every((s: string) => header.includes(s))) {
            header = [...keysOrder];
        }
        table.header = header;

        /** Body */
        const body: any[][] = Table2.normalizeData(data, header, hiddenKey);
        table.body = Table2.orderTableData(body, primaryKey);

        return table;
    }

    static generateTableStructure2(data: any[], fieldToSearch: string, keysToMerge: string[], hiddenKey: string, primaryKey?: string, keysOrder?: string[]): Table2 {
        const table = new Table2();
        if (!data.every(r => fieldToSearch in r)) return table;

        let header: string[] = Array.from(
            new Set(
                data.flatMap((r: any) => {
                    if (!(fieldToSearch in r)) return [];

                    const values = r[fieldToSearch];
                    const rest = { ...r };
                    delete rest[fieldToSearch];

                    if (!Array.isArray(values)) {
                        return Object.keys(rest);
                    }

                    return [
                        ...Object.keys(rest),
                        ...values.map((d: any) => String(d['parameter']))
                    ];
                })
            )
        )

        if (primaryKey && header.includes(primaryKey)) {
            header = [primaryKey, ...header.filter((k: string) => k !== primaryKey)];
        }
        if (keysOrder && keysOrder.every((s: string) => header.includes(s))) {
            header = [...keysOrder];
        }
        table.header = header;

        const body: any[][] = data.map((r: any) => {
            if (fieldToSearch in r) {
                const values = r[fieldToSearch];
                const rest = { ...r };
                delete rest[fieldToSearch];

                if (!Array.isArray(values)) return { ...rest };

                const row: any[] = [];

                header.forEach((key: string) => {
                    let cell = null;

                    // cerca in rest
                    if (key in rest) {
                        cell = {
                            dataKey: key,
                            dataValue: rest[key],
                            hiddenValue: undefined
                        };
                    }

                    // cerca in values (solo se non trovata)
                    if (!cell) {
                        const found = values.find((d: any) => d.parameter === key);

                        if (found) {
                            const { parameter, ...r } = found;
                            const entries = Object.entries(r);

                            let value = '';
                            keysToMerge.forEach((k: string) => {
                                const pair: [string, any] | undefined = entries.find(([kk]) => kk === k);
                                if (pair) {
                                    const isDate = Table2._isISODate(pair[1]);
                                    value += isDate
                                        ? ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]`
                                        : ` ${pair[1]}`;
                                }
                            });

                            cell = {
                                dataKey: key,
                                dataValue: value,
                                hiddenValue: found[hiddenKey]
                            };
                        }
                    }

                    // fallback: valore mancante
                    if (!cell) {
                        cell = {
                            dataKey: key,
                            dataValue: '-',
                            hiddenValue: undefined
                        };
                    }

                    row.push(cell);
                });

                // header.forEach((key: string) => {
                //     Object.entries(rest).map(([k, v]: [any, any]) => {
                //         if (key === k) {
                //             row.push({
                //                 dataKey: k,
                //                 dataValue: v,
                //                 hiddenValue: undefined
                //             })
                //         }
                //     })

                //     values.forEach((d: any) => {
                //         const { parameter, ...r } = d;
                //         if (parameter === key) {
                //             const entries: [string, any][] = Object.entries(r);

                //             let value: string = '';
                //             keysToMerge.forEach((key: string) => {
                //                 const pair: [string, any] | undefined = entries.find(([k, _]: [string, any]) => k === key);
                //                 if (pair) {
                //                     const isDate: boolean = Table2._isISODate(pair[1]);
                //                     value += isDate ?
                //                         ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]` :
                //                         ` ${pair[1]}`;
                //                 }
                //             });

                //             row.push({
                //                 dataKey: d['parameter'],
                //                 dataValue: value,
                //                 hiddenvalue: d[hiddenKey]
                //             })
                //         }
                //     })
                // });

                return row;
            }
        });
        table.body = Table2.orderTableData(body, primaryKey);
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

    static normalizeData(data: Object[], headerKeys: string[], hiddenKey?: string): any[][] {
        return data.map((d: Record<string, any>) => {
            const row: any[] = [];

            headerKeys.forEach((k: string) => {
                row.push({
                    dataKey: k,
                    dataValue: d[k] ?? '-',
                    hiddenValue: (hiddenKey && d[hiddenKey]) ? d[hiddenKey] : undefined
                })
            });

            return row;
        });
    }

    static orderTableData(data: any[][], primaryKey?: string) {
        return data.map((row: any[][]) => {
            if (!primaryKey) return row;
            const index: number = row.findIndex((o: any[]) => 'dataKey' in o && o['dataKey'] === primaryKey);
            if (index === -1) return row;
            const [primaryEntry] = row.splice(index, 1);
            return [primaryEntry, ...row];
        });
    }

    static convertRowsToKeyValueArrays(data: Map<string, any>[]): [string, any][][] {
        return data.map(rowMap => Array.from(rowMap.entries()));
    }

    public sortTableData(key: string, direction: 'asc' | 'desc' | 'none'): Table2 {
        const table = this.cloneTable();

        if (direction === 'none') {
            return table;
        }

        const columnIndex: number = this.header.indexOf(key);
        if (columnIndex === -1) {
            return table;
        }

        const sortedBody: [string, any][][] = [...this.body].sort((a, b) => {
            const aValue = a[columnIndex]?.['dataValue'];
            const bValue = b[columnIndex]?.['dataValue'];

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        table.body = [...sortedBody];
        table.header = [...this.header];

        return table;
    }

    public filterTableData(filters: Record<string, string>): Table2 {
        const table = this.cloneTable();

        table.body = table.body.filter((row: any[]) => {
            return row.every(({ dataKey, dataValue }) => {
                // Se il filtro per una chiave è vuoto o undefined, non filtriamo su quella chiave
                const filterValue = filters[dataKey];
                if (!filterValue) return true; // Consideriamo un valore vuoto o undefined come "accettabile"

                // Filtro parziale (case-insensitive) per i valori stringa
                if (typeof dataValue === 'string' && typeof filterValue === 'string') {
                    const matches: boolean = dataValue.toLowerCase().includes(filterValue.toLowerCase());
                    return matches;
                }

                // Altrimenti confronto esatto
                const exactMatch = filterValue === dataValue;
                return exactMatch;
            });
        });

        return table;
    }

    public cloneTable(): Table2 {
        const table = new Table2();
        table.header = [...this.header];
        table.body = [...this.body];
        return table;
    }

    public extractAllValuesByKey(key: string): string[] {
        const values = this.body.flatMap((row: any[]) => {
            return row
                .filter((d: any) => d['dataKey'] === key)
                .map((d: any) => d['dataValue'])
        })
            .filter((k) => k !== null);
        return Array.from(new Set(values));
    }

    public convertTableToArray(): Record<string, any>[] {
        const table: any[][] = [...this.body];

        return table.reduce((acc: Record<string, any>[], curr: any[], i: number) => {
            const r = curr.reduce((r: Record<string, any>, d: any) => {
                r[d['dataKey']] = d['dataValue'];
                return r;
            }, {} as Record<string, any>)
            acc.push(r)
            return acc;
        }, [] as Record<string, any>[]);
    }

    public getMaxValue(): number {
        return this.body.reduce((acc: number, curr: any[]) => {
            const values: number[] = curr.map((d: any) => d['dataValue']).filter((v: any) => Number.isFinite(v));
            const rowMax: number = Math.max(...values);
            if (rowMax > acc) acc = rowMax;
            return acc;
        }, 0);
    }

    static _isISODate(date: string): boolean {
        if (typeof date !== 'string') return false;

        const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
        if (!ISO_REGEX.test(date)) return false;

        return !isNaN(new Date(date).valueOf());
    }
}

/******************************************************** */
/******************************************************** */
/******************************************************** */
/******************************************************** */
/******************************************************** */
export class Table {
    public header: string[] = [];
    public body: [string, any][][] = [];

    constructor() { }

    static createTableFromArray(data: Object[]): Table {
        return Table.generateTableStructure(data);
    }

    static generateTableStructure(data: Object[], primaryKey?: string, keysOrder?: string[]): Table {
        const table = new Table();

        /** Header */
        let header = Table.extractHeaderKeys(data);
        if (primaryKey && header.includes(primaryKey)) {
            header = [primaryKey, ...header.filter((k: string) => k !== primaryKey)];
        }
        if (keysOrder && keysOrder.every((s: string) => header.includes(s))) {
            header = [...keysOrder];
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

    public convertTableToArray(): Record<string, any>[] {
        const table: [string, any][][] = [...this.body];

        return table.reduce((acc: Record<string, any>[], row: [string, any][], i: number) => {
            const r = row.reduce((r: Record<string, any>, d: [string, any]) => {
                r[d[0]] = d[1];
                return r;
            }, {} as Record<string, any>);

            acc.push(r);
            return acc;
        }, [] as Record<string, any>[]);
    }

    public getLatestDate(): number {
        return this.body.reduce((acc: number, curr: [string, any][]) => {
            const values: any[] = curr.map(([_, v]: [string, any]) => v);
            const rowMax = Math.max(...values);
            if (rowMax > acc) acc = rowMax;
            return acc;
        }, 0);
    }
}