import { LidarImg } from './lidar-img.interface'

export class Lidar {
    public id: string;
    public imgUrls: LidarImg[];
    public stationName?: string;

    constructor(id: string, imgUrls: LidarImg[], stationName?: string) {
        this.id = id;
        this.imgUrls = imgUrls;
        this.stationName = stationName;
    }
}