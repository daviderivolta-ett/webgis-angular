export class CSVUtils {
    static convertArrayToCSV(objects: Record<string, unknown>[], keysToKeep: string[]): string {
        if (!objects.length) return '';

        const keys = Array.from(
            new Set(objects.flatMap(obj => Object.keys(obj)))
        ).filter((k) => keysToKeep.includes(k));

        const content = objects.map((obj) => {
            return Object.entries(obj)
                .filter((entry: [string, unknown]) => keysToKeep.includes(entry[0]))
                .map((entry: [string, unknown]) => CSVUtils._replaceHTML(entry))
                .flatMap((entry) => entry[1] === null || isNaN(Number(entry[1])) ? entry[1] : parseFloat(String(entry[1])).toLocaleString());
        });

        const rows = [keys, ...content];

        const formattedRows = rows.map((r: unknown[]) => {
            return r.map((v: unknown) => {
                if (v instanceof Date) return `${String(v.getDate()).padStart(2, '0')}/${String(v.getMonth() + 1).padStart(2, '0')}/${v.getFullYear()}`;
                else return v;
            })
        })

        return formattedRows.map((row) => row.join(';')).join('\n');
    }

    static _replaceHTML(entry: [string, unknown]) {
        return [entry[0], typeof entry[1] === 'string' ? entry[1].replaceAll(/<[^>]*>/g, '') : entry[1]];
    }

    static convertTimestampValueArrayToCSV(array: [number, number | null][][], keys: string[]): string {
        const rows: string[][] = [keys];

        const filteredArray: [number, number][][] = array.map(dataset =>
            dataset.filter(
                (point): point is [number, number] => point[1] !== null
            )
        );

        const length: number = filteredArray.reduce((acc: number, curr: [number, number][]) => {
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

            const values: string[] = filteredArray.map((dataset: [number, number][]) => {
                return !dataset[i] ? '' : dataset[i][1].toLocaleString();
            });
            rows.push([formattedDate, ...values]);
        }

        return rows.map((row: string[]) => row.join(';')).join('\n');
    }
}