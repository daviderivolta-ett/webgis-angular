import { Geolocation } from './geolocation.interface'

export type GeolocationWithRadius = Geolocation & {
    radius: number
}