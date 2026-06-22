export class Webcam {
    public id: string;
    public imgUrl: string;
    public stationName?: string;

    constructor(id: string, imgUrl: string, stationName?: string) {
        this.id = id;
        this.imgUrl = imgUrl;
        this.stationName = stationName;
    }
}