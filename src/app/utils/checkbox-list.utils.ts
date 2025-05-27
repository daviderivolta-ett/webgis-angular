export function getUrlById(id: string, array: Record<string, any>[]): string | null {
    for (const item of array) {      
        if ('url' in item && 'id' in item && item['id'] === id) return item['url'];

        if ('options' in item && Array.isArray(item['options'])) {
            return getUrlById(id, item['options']);
        }
    }

    return null;
}