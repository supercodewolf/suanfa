const algorithms = {
  sorting: [
    {
      id: 'bubble',
      name: '冒泡排序',
      difficulty: '入门',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      stable: true,
      description: '重复遍历数组，依次比较相邻的两个元素，如果顺序错误（前大后小）就交换它们。每完成一轮遍历，最大的元素就会"冒泡"到数组末尾。就像水中的气泡，大的气泡会先浮到水面。',
      steps: ['从数组开头开始，比较相邻两个元素', '如果前一个比后一个大，交换它们', '每轮结束后，已排序区域扩大一位', '重复直到所有元素有序']
    },
    {
      id: 'selection',
      name: '选择排序',
      difficulty: '入门',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      stable: false,
      description: '每次从未排序部分中找到最小（或最大）的元素，将其放到已排序部分的末尾。就像打牌时整理手中的牌，每次都挑出最小的一张放到最前面。',
      steps: ['从未排序部分找到最小元素', '将最小元素与未排序部分的第一个元素交换', '已排序部分扩大一位', '重复直到所有元素有序']
    },
    {
      id: 'insertion',
      name: '插入排序',
      difficulty: '入门',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      stable: true,
      description: '将数组分为"已排序"和"未排序"两部分。每次从未排序部分取出第一个元素，在已排序部分中找到合适的位置并插入。类似于打牌时摸牌后插入手中已有的有序牌中。',
      steps: ['将第一个元素视为已排序', '取出下一个未排序元素', '在已排序部分从后向前比较，找到插入位置', '插入元素，已排序部分扩大一位']
    },
    {
      id: 'quick',
      name: '快速排序',
      difficulty: '进阶',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)',
      stable: false,
      description: '采用分治策略。选择一个"基准"元素，将数组分为小于基准和大于基准的两部分，然后对两部分递归地进行快速排序。是实际应用中最快的排序算法之一。',
      steps: ['选择一个元素作为基准（pivot）', '将小于基准的元素移到左边，大于的移到右边', '基准元素到达最终位置', '对左右两部分递归进行同样操作']
    },
    {
      id: 'merge',
      name: '归并排序',
      difficulty: '进阶',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      stable: true,
      description: '同样采用分治策略。将数组不断地分成两半，直到每部分只有一个元素（天然有序），然后不断地将两个有序子数组合并成一个更大的有序数组。',
      steps: ['将数组递归地对半拆分', '直到每个子数组只有一个元素', '合并两个有序子数组', '重复合并直到还原为完整有序数组']
    },
    {
      id: 'heap',
      name: '堆排序',
      difficulty: '进阶',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      stable: false,
      description: '利用堆这种数据结构来排序。首先将数组构建成一个最大堆（父节点总是大于子节点），然后反复取出堆顶元素（最大值）放到数组末尾，并调整剩余元素维持堆的性质。',
      steps: ['将数组构建成最大堆', '取出堆顶元素（最大值），放到数组末尾', '调整剩余元素，重新维持最大堆性质', '重复直到堆为空']
    }
  ],
  searching: [
    {
      id: 'linear',
      name: '线性搜索',
      difficulty: '入门',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '从数组的第一个元素开始，依次检查每个元素是否等于目标值。最简单、最直观的搜索方法，但也是最慢的。不需要数组有序。',
      steps: ['从数组第一个元素开始', '依次与目标值比较', '找到则返回位置', '遍历完未找到则返回-1']
    },
    {
      id: 'binary',
      name: '二分搜索',
      difficulty: '入门',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '在有序数组中查找目标值。每次取中间元素与目标值比较，如果相等则找到；如果目标值较小则在左半部分继续查找，较大则在右半部分继续查找。每次能将搜索范围缩小一半。要求数组必须有序。',
      steps: ['确定搜索范围的左右边界', '取中间位置的元素', '与目标值比较：等于则找到，小于则搜索右半，大于则搜索左半', '重复直到找到或范围为空']
    }
  ],
  structures: [
    {
      id: 'stack',
      name: '栈 (Stack)',
      difficulty: '入门',
      timeComplexity: 'O(1)（入/出栈）',
      spaceComplexity: 'O(n)',
      stable: null,
      description: '一种后进先出（LIFO）的数据结构。只能在一端（栈顶）进行添加和删除操作。就像一叠盘子，只能从最上面放或取。常用于函数调用、撤销操作、括号匹配等场景。',
      steps: ['栈顶是唯一操作入口', 'push：将元素压入栈顶', 'pop：从栈顶弹出元素', 'peek：查看栈顶元素但不弹出']
    },
    {
      id: 'queue',
      name: '队列 (Queue)',
      difficulty: '入门',
      timeComplexity: 'O(1)（入/出队）',
      spaceComplexity: 'O(n)',
      stable: null,
      description: '一种先进先出（FIFO）的数据结构。在队尾添加元素，在队头删除元素。就像排队买票，先来的先服务。常用于任务调度、消息队列、BFS等场景。',
      steps: ['队尾入队（enqueue），队头出队（dequeue）', 'enqueue：将元素添加到队尾', 'dequeue：从队头移除元素', 'peek：查看队头元素但不移除']
    }
  ]
};

const categories = [
  {
    id: 'sorting',
    name: '排序算法',
    icon: '📊',
    color: '#4A90D9',
    algorithms: algorithms.sorting
  },
  {
    id: 'searching',
    name: '搜索算法',
    icon: '🔍',
    color: '#27AE60',
    algorithms: algorithms.searching
  },
  {
    id: 'structures',
    name: '数据结构演示',
    icon: '🏗️',
    color: '#E67E22',
    algorithms: algorithms.structures
  }
];

function getAlgorithmById(id) {
  for (const cat of categories) {
    const found = cat.algorithms.find(a => a.id === id);
    if (found) return { category: cat, algorithm: found };
  }
  return null;
}

function getAllAlgorithms() {
  const result = [];
  for (const cat of categories) {
    for (const algo of cat.algorithms) {
      result.push({ ...algo, categoryId: cat.id, categoryName: cat.name, categoryColor: cat.color, categoryIcon: cat.icon });
    }
  }
  return result;
}

module.exports = {
  categories,
  algorithms,
  getAlgorithmById,
  getAllAlgorithms
};
