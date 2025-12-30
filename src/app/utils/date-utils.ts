export class DateUtils {
    static toUTCDate(dateString: string): string {
        const date: Date = new Date(dateString);
        return `${date.getUTCFullYear()}-${DateUtils.pad(date.getUTCMonth() + 1)}-${DateUtils.pad(date.getUTCDate())}T${DateUtils.pad(date.getUTCHours())}:${DateUtils.pad(date.getUTCMinutes())}`;
    }

    static pad(n: number): string {
        return n.toString().padStart(2, '0');
    }
}  