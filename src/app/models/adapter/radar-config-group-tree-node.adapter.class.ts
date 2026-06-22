import { RadarConfig, RadarConfigGroup } from '../radar';
import { TreeNode } from '../ui';

export class RadarConfigGroupToTreeNodeAdapter {
    static convert(group: RadarConfigGroup): TreeNode {
        const treeNode = new TreeNode(group.id);

        if (group.label) treeNode.label = group.label;
        if (group.options) {
            treeNode.options = group.options.map((opt: RadarConfigGroup | RadarConfig) => {
                if (opt instanceof RadarConfigGroup) {
                    return this.convert(opt)
                } else {
                    const tn = new TreeNode(opt.id);

                    if (opt.label) tn.label = opt.label;

                    return tn;
                }
            })
        }

        return treeNode;
    }
}