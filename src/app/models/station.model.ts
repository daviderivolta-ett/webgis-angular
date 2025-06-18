// import { Geolocation } from './geographic/geolocation.interface';

// export class Station implements Geolocation {
//     public id: string = '';
//     public name: string = '';
//     public city: string = '';
//     public lat: number = 0;
//     public lng: number = 0;
//     public alt?: number;

//     constructor(
//         id: string,
//         name: string,
//         city: string,
//         lat: number,
//         lng: number,
//         alt?: number
//     ) {
//         this.id = id;
//         this.name = name;
//         this.city = city;
//         this.lat = lat;
//         this.lng = lng;
//         if (alt) this.alt = alt;
//     }
// }

// export interface StationData {
//     updateTime: Date;
//     value: number;
// }

// export class StationRecord extends Station implements StationData {
//     public updateTime: Date;
//     public value: number;

//     constructor(id: string,
//         name: string,
//         city: string,
//         lat: number,
//         lng: number,
//         updateTime: Date,
//         value: number,
//         alt?: number
//     ) {
//         super(id, name, city, lat, lng, alt);

//         this.updateTime = updateTime;
//         this.value = value;
//     }
// }