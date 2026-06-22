import { GeolocationWithRadius } from '../geographic'

export class User {
    public id: string;
    public email: string;
    public roles: string[];
    public layers?: string[];
    public geolocation?: GeolocationWithRadius;

    constructor(
        id: string,
        email: string,
        roles: string[] = [],
        layers?: string[],
        geolocation?: GeolocationWithRadius
    ) {
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.layers = layers;
        this.geolocation = geolocation;
    }

    static createFromObject(obj: any): User | undefined {  
        if (!('sub' in obj) || typeof obj['sub'] !== 'string') return undefined;

        const id = obj['sub'];
        const email: string | undefined = obj['email'];
        const roles: string[] = ('realm_access' in obj && 'roles' in obj['realm_access'] && Array.isArray(obj['realm_access']['roles'])) ?
            obj['realm_access']['roles'] :
            [];

        if (!email || roles.length === 0) return undefined;

        const layers = ('layers' in obj && Array.isArray(obj['layers']) && obj['layers'].every((l: unknown) => typeof l === 'string')) ? [...obj['layers']] : undefined;     

        const lat = obj['geolocation'] && obj['geolocation']['latitude'] ? parseFloat(obj['geolocation']['latitude']) : undefined;
        const lng = obj['geolocation'] && obj['geolocation']['longitude'] ? parseFloat(obj['geolocation']['longitude']) : undefined;
        const radius = obj['geolocation'] && obj['geolocation']['radius_km'] ? parseFloat(obj['geolocation']['radius_km']) : undefined;
        const geolocation: GeolocationWithRadius | undefined =
            lat != null && lng != null && radius != null
                ? { lat, lng, radius }
                : undefined;

        return new User(id, email, roles, layers, geolocation);
    }
}