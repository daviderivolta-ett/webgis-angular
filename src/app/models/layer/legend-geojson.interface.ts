import { Legend } from './legend.interface'

export interface GeojsonLegend extends Legend {
    colors: string[];
    labels: string[];
}