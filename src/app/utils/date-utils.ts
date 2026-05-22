export class DateUtils {
    static toUTCDate(dateString: string): string {
        const date: Date = new Date(dateString);
        return `${date.getUTCFullYear()}-${DateUtils.pad(date.getUTCMonth() + 1)}-${DateUtils.pad(date.getUTCDate())}T${DateUtils.pad(date.getUTCHours())}:${DateUtils.pad(date.getUTCMinutes())}`;
    }

    static toApiFormat(dateString: string): string {
        const date: Date = new Date(dateString);
        return `${date.getFullYear()}-${DateUtils.pad(date.getMonth() + 1)}-${DateUtils.pad(date.getDate())}T${DateUtils.pad(date.getHours())}:${DateUtils.pad(date.getMinutes())}`
    }

    static pad(n: number): string {
        return n.toString().padStart(2, '0');
    }

    static createDateRangeFromDate(date: Date, days: number): [string, string] {
        const initialDate = new Date(date);
        initialDate.setDate(date.getDate() - days);
        return [
            `${initialDate.getFullYear()}-${DateUtils.pad(initialDate.getMonth() + 1)}-${DateUtils.pad(initialDate.getDate())}T${DateUtils.pad(initialDate.getHours())}:${DateUtils.pad(initialDate.getMinutes())}`,
            `${date.getFullYear()}-${DateUtils.pad(date.getMonth() + 1)}-${DateUtils.pad(date.getDate())}T${DateUtils.pad(date.getHours())}:${DateUtils.pad(date.getMinutes())}`
        ]

    }

    static toDateTimeLocal(date: Date): string {
        return `${date.getFullYear()}-${DateUtils.pad(date.getMonth() + 1)}-${DateUtils.pad(date.getDate())}T${DateUtils.pad(date.getHours())}:${DateUtils.pad(date.getMinutes())}`
    }

    static minutesBetweenTwoDates(firstDate: Date, secondDate: Date): number {
        return Math.abs(firstDate.getTime() - secondDate.getTime()) / (1000 * 60);
    }
}  