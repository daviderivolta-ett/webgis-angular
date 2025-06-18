import { Geolocation } from '../geographic'

export class StationBase implements Geolocation {
    public id: string;
    public lat: number;
    public lng: number;
    public name?: string;
    public city?: string;
    public alt?: number;

    constructor(
        id: string,
        lat: number,
        lng: number,
        name?: string,
        city?: string,
        alt?: number
    ) {
        this.id = id;
        this.lng = lng;
        this.lat = lat;
        this.name = name;
        this.city = city;
        this.alt = alt;
    }
}