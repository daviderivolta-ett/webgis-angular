import { MarkerCondition } from './marker-condition.interface';

export interface MarkerMapping {
    featureProperty: string;
    rules: MarkerCondition[];
}