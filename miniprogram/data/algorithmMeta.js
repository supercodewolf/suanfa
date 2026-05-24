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
      id: 'shell',
      name: '希尔排序',
      difficulty: '进阶',
      timeComplexity: 'O(n log n)~O(n²)',
      spaceComplexity: 'O(1)',
      stable: false,
      description: '插入排序的改进版。先将整个数组按一定间隔（gap）分组，对每组分别进行插入排序，然后逐步缩小间隔，直到间隔为1时完成最终排序。通过让元素"大步跳跃"，减少总的移动次数。',
      steps: ['选择一个间隔序列（如 n/2, n/4, ..., 1）', '对每个间隔，将数组按gap分组', '每组内进行插入排序', '缩小gap，重复直到gap=1完成排序']
    },
    {
      id: 'cocktail',
      name: '鸡尾酒排序',
      difficulty: '入门',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      stable: true,
      description: '冒泡排序的改进版，也叫双向冒泡排序。它先从左到右把最大值"冒泡"到末尾，再从右到左把最小值"冒泡"到开头，来回交替进行。就像调酒师摇晃鸡尾酒一样来回晃动。',
      steps: ['从左到右遍历，将最大值冒泡到右端', '缩小右边界', '从右到左遍历，将最小值冒泡到左端', '扩大左边界，重复直到左右边界相遇']
    },
    {
      id: 'counting',
      name: '计数排序',
      difficulty: '进阶',
      timeComplexity: 'O(n + k)',
      spaceComplexity: 'O(k)',
      stable: true,
      description: '一种非比较排序算法。统计每个值出现的次数，然后根据计数将元素放到正确的位置。适用于整数且取值范围不大的场景。速度极快，但需要额外空间存储计数数组。',
      steps: ['找到数组中的最大值和最小值', '创建计数数组，统计每个值的出现次数', '累加计数，确定每个值在排序后的位置', '反向遍历原数组，将元素放到正确位置']
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
    },
    {
      id: 'radix',
      name: '基数排序',
      difficulty: '进阶',
      timeComplexity: 'O(d×(n+k))',
      spaceComplexity: 'O(n + k)',
      stable: true,
      description: '一种非比较排序算法。从最低位（LSD）开始，依次按每一位数字进行稳定的计数排序，直到最高位。不直接比较元素大小，而是利用数字的位来排序。适合整数排序。',
      steps: ['找到最大数，确定位数', '从最低位开始逐位处理', '对当前位进行计数排序', '所有位处理完毕后数组有序']
    },
    {
      id: 'comb',
      name: '梳排序',
      difficulty: '进阶',
      timeComplexity: 'O(n²) 最坏',
      spaceComplexity: 'O(1)',
      stable: false,
      description: '冒泡排序的改进版，通过设置较大的间隔来比较和交换元素，消除"乌龟"（数组末尾的小值）。间隔以1.3的比例逐渐缩小（称为收缩因子），最后一轮间隔为1时等同于冒泡排序。比冒泡排序效率高很多。',
      steps: ['设置初始 gap = n / 1.3', '比较相距 gap 的两个元素，逆序则交换', '缩小 gap = gap / 1.3', '重复直到 gap = 1 且没有交换']
    },
    {
      id: 'bucket',
      name: '桶排序',
      difficulty: '进阶',
      timeComplexity: 'O(n + k) 平均',
      spaceComplexity: 'O(n + k)',
      stable: true,
      description: '将数组元素分配到多个"桶"中，每个桶内的元素再分别排序（通常用插入排序），最后按顺序将各个桶的元素合并。当数据均匀分布时效率极高。',
      steps: ['创建若干个桶', '将每个元素放入对应的桶中', '每个桶内进行排序', '按顺序合并所有桶的元素']
    }
  ],
  dp: [
    {
      id: 'fibdp',
      name: '斐波那契 DP',
      difficulty: '入门',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      stable: null,
      description: '动态规划的经典入门案例。通过自底向上（或带记忆的递归）计算斐波那契数列，避免重复计算。从 F(0)=0, F(1)=1 开始，每个后续值等于前两个值之和。',
      steps: ['初始化 F(0)=0, F(1)=1', '从2开始逐个计算 F(n) = F(n-1) + F(n-2)', '保存每个中间结果避免重复计算', '返回 F(n)']
    },
    {
      id: 'knapsack',
      name: '0/1 背包问题',
      difficulty: '进阶',
      timeComplexity: 'O(n×W)',
      spaceComplexity: 'O(n×W)',
      stable: null,
      description: '给定一组物品，每个物品有重量和价值，在背包容量限制下选择物品装入背包，使得总价值最大。每个物品只能选或不选（0/1）。用二维DP表格记录每个状态的最优解。',
      steps: ['创建 DP 表格：行=物品，列=容量', '逐个物品考虑：选或不选', '若不选：继承上一行值', '若选：比较 选与不选 的最大值']
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
    },
    {
      id: 'jump',
      name: '跳跃搜索',
      difficulty: '进阶',
      timeComplexity: 'O(√n)',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '在有序数组中，每次跳跃固定步长（√n）来查找目标值。当跳过的元素大于目标值时，再线性回溯查找。比线性搜索快，比二分搜索简单。要求数组有序。',
      steps: ['设定步长为 √n', '从开头每次跳跃步长个位置', '直到元素大于等于目标值或到达末尾', '在跳过的区间内线性搜索目标值']
    },
    {
      id: 'interpolation',
      name: '插值搜索',
      difficulty: '进阶',
      timeComplexity: 'O(log log n) 平均',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '二分搜索的改进版。不是总是取中间位置，而是根据目标值的大小，用插值公式估算目标值可能的位置。当数据均匀分布时，比二分搜索更快。类似于在字典中查单词，你会根据首字母翻到大致位置。',
      steps: ['用插值公式估算目标位置', '比较估算位置的元素与目标值', '根据比较结果缩小搜索范围', '重复直到找到或范围为空']
    },
    {
      id: 'fibonacciSearch',
      name: '斐波那契搜索',
      difficulty: '进阶',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '利用斐波那契数列进行分割的搜索算法。不像二分搜索那样取中间位置，而是用斐波那契数作为分割点。每次比较后缩小范围，比二分搜索需要的比较次数更少（只需加减法），适合在磁带等顺序访问介质上使用。',
      steps: ['找到最小斐波那契数 ≥ n', '用斐波那契数确定分割点', '比较分割点元素与目标值', '根据结果缩小范围，用下一个斐波那契数继续']
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
  ],
  math: [
    {
      id: 'sieve',
      name: '埃拉托色尼筛法',
      difficulty: '入门',
      timeComplexity: 'O(n log log n)',
      spaceComplexity: 'O(n)',
      stable: null,
      description: '一种高效找出一定范围内所有素数的古老算法。从2开始，每找到一个素数，就把它的所有倍数标记为非素数。就像用筛子把合数筛掉，留下的就是素数。',
      steps: ['列出2到N的所有整数', '从2开始，标记2的所有倍数为非素数', '找到下一个未标记的数（即素数），标记其倍数', '重复直到处理完所有数']
    },
    {
      id: 'gcd',
      name: '欧几里得算法 (GCD)',
      difficulty: '入门',
      timeComplexity: 'O(log min(a,b))',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '计算两个数的最大公约数（GCD）。核心原理：两个数的最大公约数等于其中较小的数和两数相除余数的最大公约数。反复用较小数去除较大数取余，直到余数为0。',
      steps: ['用较大数除以较小数，取余数', '如果余数为0，较小数即为GCD', '否则用较小数和余数重复上述过程', '直到余数为0，最后的除数即为GCD']
    },
    {
      id: 'fastpower',
      name: '快速幂',
      difficulty: '入门',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      stable: null,
      description: '高效计算 a^n 的算法（通常取模）。利用二进制拆分：当指数为偶数时 a^n = (a²)^(n/2)，当指数为奇数时 a^n = a × (a²)^((n-1)/2)。将 O(n) 次乘法降为 O(log n) 次。',
      steps: ['初始化结果 result = 1', '当指数 > 0 时循环', '若指数为奇数，result *= 底数', '底数自乘，指数减半，重复直到指数为0']
    }
  ],
  graph: [
    {
      id: 'bfs',
      name: 'BFS 广度优先搜索',
      difficulty: '进阶',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      stable: null,
      description: '从起点开始，逐层向外探索，先访问所有距离为1的节点，再访问距离为2的节点，依此类推。使用队列来管理待访问节点。可以用来找最短路径（在无权图中）。',
      steps: ['将起点加入队列并标记为已访问', '从队列中取出一个节点', '检查该节点的所有未访问邻居，加入队列', '重复直到找到目标或队列为空']
    },
    {
      id: 'dfs',
      name: 'DFS 深度优先搜索',
      difficulty: '进阶',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      stable: null,
      description: '从起点开始，沿着一条路径一直走到尽头，然后回溯到上一个分岔口，再尝试另一条路径。使用栈（或递归）来管理探索路径。适合探索所有可能路径。',
      steps: ['将起点压入栈并标记为已访问', '从栈中弹出当前节点', '将该节点的未访问邻居压入栈', '重复直到找到目标或栈为空']
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
    id: 'graph',
    name: '图算法',
    icon: '🗺️',
    color: '#9B59B6',
    algorithms: algorithms.graph
  },
  {
    id: 'structures',
    name: '数据结构演示',
    icon: '🏗️',
    color: '#E67E22',
    algorithms: algorithms.structures
  },
  {
    id: 'dp',
    name: '动态规划',
    icon: '🧮',
    color: '#3498DB',
    algorithms: algorithms.dp
  },
  {
    id: 'math',
    name: '数学算法',
    icon: '🔢',
    color: '#1ABC9C',
    algorithms: algorithms.math
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
