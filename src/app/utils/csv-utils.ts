export class CSVUtils {
    static convertArrayToCSV(objects: Record<string, any>[], keysToKeep: string[]): string {
        if (!objects.length) return '';

        const keys = Array.from(
            new Set(objects.flatMap(obj => Object.keys(obj)))
        ).filter((k) => keysToKeep.includes(k));

        const content = objects.map((obj) => {
            return Object.entries(obj)
                .filter((entry: [string, any]) => keysToKeep.includes(entry[0]))
                .map((entry: [string, any]) => CSVUtils._replaceHTML(entry))
                .flatMap((entry) => entry[1] === null || isNaN(Number(entry[1])) ? entry[1] : parseFloat(entry[1]).toLocaleString());
        });       

        const rows = [keys, ...content];

        const formattedRows = rows.map((r: any[]) => {
            return r.map((v: any) => {
                if (v instanceof Date) return `${String(v.getDate()).padStart(2, '0')}/${String(v.getMonth() + 1).padStart(2, '0')}/${v.getFullYear()}`;
                else return v;
            })
        })   

        return formattedRows.map((row) => row.join(';')).join('\n');
    }

    static _replaceHTML(entry: [string, any]) {             
        return [entry[0], typeof entry[1] === 'string' ? entry[1].replaceAll(/<[^>]*>/g, '') : entry[1]];
    }

    static convertTimestampValueArrayToCSV(array: [number, number][][], keys: string[]): string {
        const rows: any[] = [keys];

        const length: number = array.reduce((acc: number, curr: [number, number][]) => {
            acc = (curr.length > acc) ? curr.length : acc;
            return acc;
        }, 0);

        for (let i = 0; i < length; i++) {
            const timestamp = array[0][i]?.[0] ?? '';
            const date = new Date(timestamp);
            const formattedDate = typeof timestamp === 'number' ?
                (
                    `${String(date.getDate()).padStart(2, '0')}/` +
                    `${String(date.getMonth() + 1).padStart(2, '0')}/` +
                    `${date.getFullYear()} ` +
                    `${String(date.getHours()).padStart(2, '0')}:` +
                    `${String(date.getMinutes()).padStart(2, '0')}`
                ) :
                '';

            const values: number[] = array.map((dataset: [number, number][]) => dataset[i]?.[1] ?? '');
            rows.push([formattedDate, ...values]);
        }
       
        return rows.map((row: any) => row.join(',')).join('\n');
    }
}