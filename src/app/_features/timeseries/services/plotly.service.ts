export function traverseLayout(value: unknown, replacements: Map<string, (ctx: Record<string, any>) => any>, ctx: Record<string, any>): unknown {
    if (typeof value === "string") {
        const match = value.match(/^\$([^$]+)\$$/);

        if (match) {
            const resolver = replacements.get(match[1]);
            if (resolver) {
                return resolver(ctx);
            }
        }

        return value;
    }

    if (Array.isArray(value)) {
        return value.map(item => traverseLayout(item, replacements, ctx));
    }

    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [
                key,
                traverseLayout(val, replacements, ctx)
            ])
        );
    }

    return value;
}