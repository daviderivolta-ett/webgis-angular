export function getValuesByNestedKey(array: Record<string, any>[], keyToReturn: string, keyToFind: string, nestedKey: string, result: string[] = []): string[] {

    for (const item of array) {
        if (keyToReturn in item && keyToFind in item && item[keyToFind]) {
            result.push(item[keyToReturn]);
        }

        if (nestedKey in item && Array.isArray(item[nestedKey])) {
            getValuesByNestedKey(item[nestedKey], keyToReturn, keyToFind, nestedKey, result);
        }
    }

    return result;
}

export function confrontArrays(firstArray: string[], secondArray: string[]): { added: string[], removed: string[] } {
    const firstSet = new Set(firstArray);
    const secondSet = new Set(secondArray);

    const added = [...secondSet].filter((item: string) => !firstSet.has(item));
    const removed = [...firstSet].filter((item: string) => !secondSet.has(item));

    return { added, removed };
}

export function findObjectsByIds(ids: string[], objects: any[]): any[] {
    let result: any[] = [];
    objects.forEach((object: any) => {
        if (ids.includes(object.id)) result.push(object);
    });
    return result;
}