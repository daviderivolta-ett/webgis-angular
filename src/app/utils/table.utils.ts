export type Table = {
    header: string[],
    body: [string, any][][]
}

export function generateTableStructure(data: Object[]): Table {
    const header: string[] = extractHeaderKeys(data);
    return {
        header,
        body: convertRowsToKeyValueArrays(normalizeDataToMap(data, header))
    }
}

export function extractHeaderKeys(data: Object[]): string[] {
    return [...new Set(data.flatMap((d: Object) => Object.keys(d)))];
}

export function normalizeDataToMap(data: Object[], headerKeys: string[]): Map<string, any>[] {
    return data.map((d: Record<string, any>) => {
        const row: Map<string, any> = new Map<string, any>();

        headerKeys.forEach((k: string) => {
            row.set(k, Object.prototype.hasOwnProperty.call(d, k) ? d[k] : '-');
        });

        return row;
    });
}

export function convertRowsToKeyValueArrays(data: Map<string, any>[]): [string, any][][] {
    return data.map(rowMap => Array.from(rowMap.entries()));
}

export function sortTableData(table: Table, key: string, direction: 'asc' | 'desc' | 'none'): Table {
    if (direction === 'none') {
        return {
            header: [...table.header],
            body: [...table.body]
        }
    }

    const columnIndex: number = table.header.indexOf(key);
    if (columnIndex === -1) {
        return table;
    }

    const sortedBody: [string, any][][] = [...table.body].sort((a, b) => {
        const aValue = a[columnIndex]?.[1];
        const bValue = b[columnIndex]?.[1];

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return {
        header: [...table.header],
        body: sortedBody,
    };
}