import { Layer, LayerGroup } from '../layer';
import { GroupedCheckboxItem } from '../ui';

export class LayerGroupToCheckboxAdapter {

    static convert(group: LayerGroup): GroupedCheckboxItem {       
        const checkbox = new GroupedCheckboxItem(group.id);

        checkbox.label = group.label;
        checkbox.iconUrl = group.iconUrl;
        checkbox.maxSelections = group.maxNumber;
        checkbox.isVisible = !group.requiresAuth;

        if (group.options) {
            checkbox.options = group.options.map((opt: LayerGroup | Layer) => {             
                if (opt instanceof LayerGroup) {                    
                    return this.convert(opt);
                } else {                                     
                    const item = new GroupedCheckboxItem(opt.id);
                    item.label = opt.label;
                    item.iconUrl = opt.iconUrl;
                    item.isChecked = false;
                    item.isDisabled = false;
                    item.isVisible = !opt.requiresAuth;
                    item.action = { ...opt.action };
                    return item;
                }
            });
        }
     
        return checkbox;
    }

}