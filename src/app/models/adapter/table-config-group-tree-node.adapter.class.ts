import { TableConfig, TableConfigGroup } from '../table';
import { TreeNode } from '../ui';

export class TableConfigGroupToTreeNodeAdapter {
    static convert(group: TableConfigGroup): TreeNode {
        const treeNode = new TreeNode(group.id);

        if (group.label) treeNode.label = group.label;
        if (group.options) {
            treeNode.options = group.options.map((opt: TableConfig) => {
                const tn = new TreeNode(opt.id);

                if (opt.label) tn.label = opt.label;

                return tn;
            })
        }

        return treeNode;
    }
}