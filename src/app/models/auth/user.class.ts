import { GeolocationWithRadius } from '../geographic'

export class User {
    public email: string;
    public roles: string[];
    public geolocation?: GeolocationWithRadius

    constructor(
        email: string,
        roles: string[] = [],
        geolocation?: GeolocationWithRadius
    ) {
        this.email = email;
        this.roles = roles;
        this.geolocation = geolocation;
    }

    static createFromObject(obj: any): User | undefined {
        const email: string | undefined = obj['email'];
        const roles: string[] = ('realm_access' in obj && 'roles' in obj['realm_access'] && Array.isArray(obj['realm_access']['roles'])) ?
            obj['realm_access']['roles'] :
            [];

        if (!email || roles.length === 0) return undefined;

        const lat = obj['geolocation'] && obj['geolocation']['latitude'] ? parseFloat(obj['geolocation']['latitude']) : undefined;
        const lng = obj['geolocation'] && obj['geolocation']['longitude'] ? parseFloat(obj['geolocation']['longitude']) : undefined;
        const radius = obj['geolocation'] && obj['geolocation']['radius_km'] ? parseFloat(obj['geolocation']['radius_km']) : undefined;
        const geolocation: GeolocationWithRadius | undefined =
            lat != null && lng != null && radius != null
                ? { lat, lng, radius }
                : undefined;

        return new User(email, roles, geolocation);
    }
}