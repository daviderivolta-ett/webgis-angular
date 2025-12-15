import { RadarConfig, RadarConfigGroup } from '../radar';
import { GroupedCheckboxItem } from '../ui';

export class RadarConfigGroupToCheckboxAdapter {

    static convert(group: RadarConfigGroup): GroupedCheckboxItem {
        const checkbox = new GroupedCheckboxItem(group.id);

        checkbox.label = group.label;
        checkbox.maxSelections = group.maxNumber;

        if (group.options) {
            checkbox.options = group.options.map((opt: RadarConfigGroup | RadarConfig) => {
                if (opt instanceof RadarConfigGroup) {
                    return this.convert(opt)
                } else {
                    const item = new GroupedCheckboxItem(opt.id);
                    item.label = opt.label;
                    item.isChecked = false;
                    item.isDisabled = false;
                    item.isVisible = true;
                    return item;
                }
            })
        }

        return checkbox;
    }

}