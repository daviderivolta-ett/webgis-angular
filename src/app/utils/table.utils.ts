export function generateTableStructure(data: Object[]): { header: string[], body: [string, any][][] } {
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