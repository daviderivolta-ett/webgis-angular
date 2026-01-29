import { FilterCondition } from './feature-filter-condition.interface'

export interface FeatureFilter {
    featureProperty: string;
    rule: FilterCondition;
}