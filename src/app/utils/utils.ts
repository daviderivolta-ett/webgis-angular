export class Utils {
    static getValuesByNestedKey(array: Record<string, any>[], keyToReturn: string, keyToFind: string, nestedKey: string, result: string[] = []): string[] {

        for (const item of array) {
            if (keyToReturn in item && keyToFind in item && item[keyToFind]) {
                result.push(item[keyToReturn]);
            }

            if (nestedKey in item && Array.isArray(item[nestedKey])) {
                Utils.getValuesByNestedKey(item[nestedKey], keyToReturn, keyToFind, nestedKey, result);
            }
        }

        return result;
    }

    static confrontArrays(firstArray: string[], secondArray: string[]): { added: string[], removed: string[] } {
        const firstSet = new Set(firstArray);
        const secondSet = new Set(secondArray);

        const added = [...secondSet].filter((item: string) => !firstSet.has(item));
        const removed = [...firstSet].filter((item: string) => !secondSet.has(item));

        return { added, removed };
    }

    static findObjectsByIds(ids: string[], objects: any[]): any[] {
        let result: any[] = [];
        objects.forEach((object: any) => {
            if (ids.includes(object.id)) result.push(object);
        });
        return result;
    }

    static svgElementToImgSrc(svg: SVGSVGElement): string {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        if (!svgString.includes('xlmns')) svg.setAttribute('xlmns', 'http://www.w3.org/2000/svg');

        const encoded = encodeURIComponent(svgString);
        return `data:image/svg+xml,${encoded}`;
    }
}