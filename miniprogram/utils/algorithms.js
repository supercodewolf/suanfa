/**
 * 算法核心实现模块
 * 每个算法函数返回 { snapshots, result } 
 * snapshots 是步骤快照数组，用于动画回放
 */

// ==================== 排序算法 ====================

/**
 * 冒泡排序
 */
function bubbleSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      snapshots.push(snapshot(
        [...array], [j, j + 1], [], sortedRange(n - i, n),
        `比较 ${array[j]} 和 ${array[j + 1]}`
      ));

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        snapshots.push(snapshot(
          [...array], [], [j, j + 1], sortedRange(n - i, n),
          `交换 ${array[j + 1]} 和 ${array[j]}`
        ));
      }
    }
    if (!swapped) break;
  }

  snapshots.push(snapshot(
    [...array], [], [], allIndices(n), '排序完成！'
  ));

  return { snapshots, result: array };
}

/**
 * 选择排序
 */
function selectionSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      snapshots.push(snapshot(
        [...array], [minIdx, j], [], sortedRange(0, i),
        `比较当前最小值 ${array[minIdx]} 和 ${array[j]}`
      ));
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      const minVal = array[minIdx]; // 交换前先记下最小值
      const oldVal = array[i];
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      snapshots.push(snapshot(
        [...array], [], [i, minIdx], sortedRange(0, i + 1),
        `交换 位置${i}(${oldVal}) 和 位置${minIdx}(${minVal})`
      ));
    } else {
      snapshots.push(snapshot(
        [...array], [], [], sortedRange(0, i + 1),
        `位置 ${i} 的元素已在正确位置`
      ));
    }
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

/**
 * 插入排序
 */
function insertionSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [0], '初始数组，第一个元素视为已排序'));

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    snapshots.push(snapshot(
      [...array], [i], [], sortedRange(0, i),
      `取出元素 ${key}，在已排序部分中寻找插入位置`
    ));

    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      snapshots.push(snapshot(
        [...array], [], [j, j + 1], sortedRange(0, i),
        `${array[j]} > ${key}，将 ${array[j]} 后移`
      ));
      j--;
    }
    array[j + 1] = key;
    snapshots.push(snapshot(
      [...array], [], [j + 1], sortedRange(0, i + 1),
      `将 ${key} 插入到位置 ${j + 1}`
    ));
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

/**
 * 快速排序（使用迭代方法记录步骤）
 */
function quickSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  const stack = [[0, n - 1]];
  let sortedSet = new Set();

  while (stack.length > 0) {
    const [low, high] = stack.pop();
    if (low >= high) {
      sortedSet.add(low);
      snapshots.push(snapshot(
        [...array], [], [], [...sortedSet],
        `子数组 [${low}..${high}] 长度≤1，自然有序`
      ));
      continue;
    }

    snapshots.push(snapshot(
      [...array], [low, high], [], [...sortedSet],
      `处理子数组 [${low}..${high}]`
    ));

    const pivotIndex = partition(array, low, high, snapshots, sortedSet);
    sortedSet.add(pivotIndex);

    snapshots.push(snapshot(
      [...array], [], [pivotIndex], [...sortedSet],
      `基准元素 ${array[pivotIndex]} 已就位于位置 ${pivotIndex}`
    ));

    if (pivotIndex + 1 < high) stack.push([pivotIndex + 1, high]);
    if (low < pivotIndex - 1) stack.push([low, pivotIndex - 1]);
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

function partition(array, low, high, snapshots, sortedSet) {
  const pivot = array[high];
  let i = low - 1;

  snapshots.push(snapshot(
    [...array], [high], [], [...sortedSet],
    `选择 ${pivot} 作为基准（位置 ${high}）`
  ));

  for (let j = low; j < high; j++) {
    snapshots.push(snapshot(
      [...array], [j, high], [], [...sortedSet],
      `比较 ${array[j]} 和基准 ${pivot}`
    ));
    if (array[j] <= pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];
      if (i !== j) {
        snapshots.push(snapshot(
          [...array], [], [i, j], [...sortedSet],
          `${array[i]} ≤ ${pivot}，交换到左边`
        ));
      }
    }
  }
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  snapshots.push(snapshot(
    [...array], [], [i + 1, high], [...sortedSet],
    `将基准 ${pivot} 放到最终位置 ${i + 1}`
  ));
  return i + 1;
}

/**
 * 归并排序
 */
function mergeSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  mergeSortRecursive(array, 0, n - 1, snapshots);

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

function mergeSortRecursive(array, left, right, snapshots) {
  if (left >= right) {
    snapshots.push(snapshot(
      [...array], [], [left], [],
      `子数组 [${left}..${right}] 长度≤1，自然有序`
    ));
    return;
  }

  const mid = Math.floor((left + right) / 2);

  snapshots.push(snapshot(
    [...array], [left, right], [mid], [],
    `拆分子数组 [${left}..${right}] → [${left}..${mid}] 和 [${mid + 1}..${right}]`
  ));

  mergeSortRecursive(array, left, mid, snapshots);
  mergeSortRecursive(array, mid + 1, right, snapshots);

  // 归并
  merge(array, left, mid, right, snapshots);
}

function merge(array, left, mid, right, snapshots) {
  const leftArr = array.slice(left, mid + 1);
  const rightArr = array.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;

  snapshots.push(snapshot(
    [...array], [left, right], [left, mid + 1],
    [],
    `合并 [${left}..${mid}] 和 [${mid + 1}..${right}]`
  ));

  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      array[k] = leftArr[i];
      snapshots.push(snapshot(
        [...array], [k], [],
        [],
        `取左部 ${leftArr[i]} 放入位置 ${k}`
      ));
      i++;
    } else {
      array[k] = rightArr[j];
      snapshots.push(snapshot(
        [...array], [k], [],
        [],
        `取右部 ${rightArr[j]} 放入位置 ${k}`
      ));
      j++;
    }
    k++;
  }

  while (i < leftArr.length) {
    array[k] = leftArr[i];
    snapshots.push(snapshot(
      [...array], [k], [], [],
      `剩余左部 ${leftArr[i]} 放入位置 ${k}`
    ));
    i++;
    k++;
  }

  while (j < rightArr.length) {
    array[k] = rightArr[j];
    snapshots.push(snapshot(
      [...array], [k], [], [],
      `剩余右部 ${rightArr[j]} 放入位置 ${k}`
    ));
    j++;
    k++;
  }
}

/**
 * 堆排序
 */
function heapSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  // 构建最大堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(array, n, i, snapshots, []);
    snapshots.push(snapshot(
      [...array], [i], [], [],
      `调整节点 ${i}，维持最大堆性质`
    ));
  }

  snapshots.push(snapshot([...array], [], [], [], '最大堆构建完成'));

  const sorted = [];
  // 逐个提取堆顶
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    sorted.unshift(i);
    snapshots.push(snapshot(
      [...array], [], [0, i], sorted,
      `取出最大值 ${array[i]} 放到位置 ${i}`
    ));
    heapify(array, i, 0, snapshots, sorted);
  }

  sorted.unshift(0);
  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

function heapify(array, heapSize, rootIndex, snapshots, sorted) {
  let largest = rootIndex;
  const left = 2 * rootIndex + 1;
  const right = 2 * rootIndex + 2;

  if (left < heapSize && array[left] > array[largest]) {
    largest = left;
  }
  if (right < heapSize && array[right] > array[largest]) {
    largest = right;
  }

  if (largest !== rootIndex) {
    [array[rootIndex], array[largest]] = [array[largest], array[rootIndex]];
    snapshots.push(snapshot(
      [...array], [], [rootIndex, largest], sorted,
      `交换 ${array[largest]} 和 ${array[rootIndex]}`
    ));
    heapify(array, heapSize, largest, snapshots, sorted);
  }
}

// ==================== 搜索算法 ====================

/**
 * 线性搜索
 */
function linearSearch(arr, target) {
  const snapshots = [];
  const n = arr.length;

  snapshots.push(snapshot(arr, [], [], [], `开始搜索目标值 ${target}`));

  for (let i = 0; i < n; i++) {
    snapshots.push(snapshot(
      [...arr], [i], [], [],
      `检查位置 ${i}：${arr[i]} == ${target} ?`
    ));
    if (arr[i] === target) {
      snapshots.push(snapshot(
        [...arr], [], [i], [],
        `找到！目标值 ${target} 在位置 ${i}`
      ));
      return { snapshots, result: i };
    }
  }

  snapshots.push(snapshot(
    [...arr], [], [], [],
    `未找到目标值 ${target}`
  ));
  return { snapshots, result: -1 };
}

/**
 * 二分搜索
 */
function binarySearch(arr, target) {
  const snapshots = [];
  const sorted = [...arr].sort((a, b) => a - b);

  snapshots.push(snapshot(sorted, [], [], [], `开始二分搜索目标值 ${target}（数组需有序）`));

  let left = 0, right = sorted.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    snapshots.push(snapshot(
      [...sorted], [mid], [], [],
      `中间位置 ${mid} = ${sorted[mid]}，与 ${target} 比较`,
      { left, right, mid }
    ));

    if (sorted[mid] === target) {
      snapshots.push(snapshot(
        [...sorted], [], [mid], [],
        `找到！目标值 ${target} 在位置 ${mid}`,
        { left, right, mid }
      ));
      return { snapshots, result: mid };
    } else if (sorted[mid] < target) {
      left = mid + 1;
      snapshots.push(snapshot(
        [...sorted], [], [], [],
        `${sorted[mid]} < ${target}，搜索右半部分 [${left}..${right}]`,
        { left, right, mid }
      ));
    } else {
      right = mid - 1;
      snapshots.push(snapshot(
        [...sorted], [], [], [],
        `${sorted[mid]} > ${target}，搜索左半部分 [${left}..${right}]`,
        { left, right, mid }
      ));
    }
  }

  snapshots.push(snapshot(sorted, [], [], [], `未找到目标值 ${target}`));
  return { snapshots, result: -1 };
}

// ==================== 数据结构演示 ====================

/**
 * 栈操作演示
 */
function stackDemo() {
  const snapshots = [];
  const stack = [];
  const ops = [
    { type: 'push', value: 3 },
    { type: 'push', value: 7 },
    { type: 'push', value: 5 },
    { type: 'pop', value: null },
    { type: 'push', value: 9 },
    { type: 'push', value: 1 },
    { type: 'pop', value: null },
    { type: 'pop', value: null },
    { type: 'pop', value: null },
    { type: 'pop', value: null }
  ];

  snapshots.push({
    type: 'stack',
    array: [],
    top: -1,
    action: '空栈初始化',
    highlight: -1
  });

  for (const op of ops) {
    if (op.type === 'push') {
      stack.push(op.value);
      snapshots.push({
        type: 'stack',
        array: [...stack],
        top: stack.length - 1,
        action: `Push(${op.value}) — 压入栈顶`,
        highlight: stack.length - 1
      });
    } else {
      if (stack.length > 0) {
        const popped = stack.pop();
        snapshots.push({
          type: 'stack',
          array: [...stack],
          top: stack.length - 1,
          action: `Pop() → ${popped} — 弹出栈顶`,
          highlight: stack.length
        });
      } else {
        snapshots.push({
          type: 'stack',
          array: [],
          top: -1,
          action: 'Pop() 失败 — 栈已空',
          highlight: -1
        });
      }
    }
  }

  return { snapshots, result: null };
}

/**
 * 队列操作演示
 */
function queueDemo() {
  const snapshots = [];
  const queue = [];
  const ops = [
    { type: 'enqueue', value: 3 },
    { type: 'enqueue', value: 7 },
    { type: 'enqueue', value: 5 },
    { type: 'dequeue' },
    { type: 'enqueue', value: 9 },
    { type: 'enqueue', value: 1 },
    { type: 'dequeue' },
    { type: 'dequeue' },
    { type: 'dequeue' },
    { type: 'dequeue' }
  ];

  snapshots.push({
    type: 'queue',
    array: [],
    front: -1,
    rear: -1,
    action: '空队列初始化',
    highlight: -1
  });

  for (const op of ops) {
    if (op.type === 'enqueue') {
      queue.push(op.value);
      snapshots.push({
        type: 'queue',
        array: [...queue],
        front: 0,
        rear: queue.length - 1,
        action: `Enqueue(${op.value}) — 加入队尾`,
        highlight: queue.length - 1
      });
    } else {
      if (queue.length > 0) {
        const val = queue.shift();
        snapshots.push({
          type: 'queue',
          array: [...queue],
          front: queue.length > 0 ? 0 : -1,
          rear: queue.length - 1,
          action: `Dequeue() → ${val} — 移除队头`,
          highlight: 0
        });
      } else {
        snapshots.push({
          type: 'queue',
          array: [],
          front: -1,
          rear: -1,
          action: 'Dequeue() 失败 — 队列已空',
          highlight: -1
        });
      }
    }
  }

  return { snapshots, result: null };
}

// ==================== 扩展排序算法 ====================

/**
 * 希尔排序
 */
function shellSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    snapshots.push(snapshot(
      [...array], [], [], [],
      `使用间隔 gap = ${gap} 进行分组插入排序`
    ));

    for (let i = gap; i < n; i++) {
      const temp = array[i];
      let j = i;

      snapshots.push(snapshot(
        [...array], [i], [], sortedRange(0, 0),
        `取出元素 ${temp}（位置${i}），与间隔${gap}之前的元素比较`
      ));

      while (j >= gap && array[j - gap] > temp) {
        array[j] = array[j - gap];
        snapshots.push(snapshot(
          [...array], [], [j, j - gap], [],
          `${array[j - gap]} > ${temp}，后移`
        ));
        j -= gap;
      }
      array[j] = temp;
      if (j !== i) {
        snapshots.push(snapshot(
          [...array], [], [j], [],
          `将 ${temp} 放入位置 ${j}`
        ));
      }
    }
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

/**
 * 鸡尾酒排序
 */
function cocktailSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  let left = 0, right = n - 1;
  let sorted = [];

  while (left < right) {
    // 从左到右冒泡
    let swapped = false;
    snapshots.push(snapshot(
      [...array], [], [], [...sorted],
      `→ 从左到右遍历 [${left}..${right}]，将最大值冒泡到右端`
    ));
    for (let i = left; i < right; i++) {
      snapshots.push(snapshot(
        [...array], [i, i + 1], [], [...sorted],
        `比较 ${array[i]} 和 ${array[i + 1]}`
      ));
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
        snapshots.push(snapshot(
          [...array], [], [i, i + 1], [...sorted],
          `交换 ${array[i + 1]} 和 ${array[i]}`
        ));
      }
    }
    sorted.push(right);
    right--;
    snapshots.push(snapshot(
      [...array], [], [], [...sorted],
      `最大值 ${array[right + 1]} 已到达位置 ${right + 1}`
    ));

    if (!swapped) break;

    // 从右到左冒泡
    swapped = false;
    snapshots.push(snapshot(
      [...array], [], [], [...sorted],
      `← 从右到左遍历 [${left}..${right}]，将最小值冒泡到左端`
    ));
    for (let i = right; i > left; i--) {
      snapshots.push(snapshot(
        [...array], [i - 1, i], [], [...sorted],
        `比较 ${array[i - 1]} 和 ${array[i]}`
      ));
      if (array[i - 1] > array[i]) {
        [array[i - 1], array[i]] = [array[i], array[i - 1]];
        swapped = true;
        snapshots.push(snapshot(
          [...array], [], [i - 1, i], [...sorted],
          `交换 ${array[i]} 和 ${array[i - 1]}`
        ));
      }
    }
    sorted.push(left);
    left++;
    snapshots.push(snapshot(
      [...array], [], [], [...sorted],
      `最小值 ${array[left - 1]} 已到达位置 ${left - 1}`
    ));

    if (!swapped) break;
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

/**
 * 计数排序
 */
function countingSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;
  const min = Math.min(...array);
  const max = Math.max(...array);
  const range = max - min + 1;

  snapshots.push(snapshot(array, [], [], [], `初始数组 (范围: ${min}~${max})`));

  // 计数
  const count = new Array(range).fill(0);
  for (let i = 0; i < n; i++) {
    count[array[i] - min]++;
    snapshots.push(snapshot(
      [...array], [i], [], [],
      `统计 ${array[i]} 出现次数: count[${array[i] - min}] = ${count[array[i] - min]}`
    ));
  }

  // 累加计数
  snapshots.push(snapshot([...array], [], [], [], '累加计数，确定每个值的最终位置'));
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  // 放置元素（反向遍历保证稳定性）
  const output = new Array(n).fill(0);  // 用 0 填充避免 undefined 导致 visualizer 报错
  for (let i = n - 1; i >= 0; i--) {
    const idx = count[array[i] - min] - 1;
    output[idx] = array[i];
    count[array[i] - min]--;
    snapshots.push(snapshot(
      [...output], [i], [idx], sortedRange(n - i - 1, n),
      `将 ${array[i]} 放到排序后位置 ${idx}`
    ));
  }

  snapshots.push(snapshot(output, [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: output };
}

// ==================== 扩展搜索算法 ====================

/**
 * 跳跃搜索
 */
function jumpSearch(arr, target) {
  const snapshots = [];
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const jumpSize = Math.floor(Math.sqrt(n));
  let step = jumpSize;

  snapshots.push(snapshot(sorted, [], [], [], `开始跳跃搜索目标值 ${target}，步长 = ${jumpSize}`));

  let prev = 0;
  while (sorted[Math.min(step, n) - 1] < target) {
    snapshots.push(snapshot(
      [...sorted], [Math.min(step, n) - 1], [], [],
      `跳跃到位置 ${Math.min(step, n) - 1} = ${sorted[Math.min(step, n) - 1]} < ${target}`,
      { left: prev, right: Math.min(step, n) - 1, mid: Math.min(step, n) - 1 }
    ));
    prev = step;
    step += jumpSize;
    if (prev >= n) {
      snapshots.push(snapshot(sorted, [], [], [], `未找到目标值 ${target}`));
      return { snapshots, result: -1 };
    }
  }

  snapshots.push(snapshot(
    [...sorted], [prev], [], [],
    `在区间 [${prev}..${Math.min(step, n) - 1}] 中线性搜索`,
    { left: prev, right: Math.min(step, n) - 1, mid: prev }
  ));

  while (prev < Math.min(step, n)) {
    snapshots.push(snapshot(
      [...sorted], [prev], [], [],
      `检查位置 ${prev}：${sorted[prev]} == ${target} ?`,
      { left: prev, right: Math.min(step, n) - 1, mid: prev }
    ));
    if (sorted[prev] === target) {
      snapshots.push(snapshot(
        [...sorted], [], [prev], [],
        `找到！目标值 ${target} 在位置 ${prev}`
      ));
      return { snapshots, result: prev };
    }
    prev++;
  }

  snapshots.push(snapshot(sorted, [], [], [], `未找到目标值 ${target}`));
  return { snapshots, result: -1 };
}

/**
 * 插值搜索
 */
function interpolationSearch(arr, target) {
  const snapshots = [];
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;

  snapshots.push(snapshot(sorted, [], [], [], `开始插值搜索目标值 ${target}`));

  let low = 0, high = n - 1;

  while (low <= high && target >= sorted[low] && target <= sorted[high]) {
    if (low === high) {
      if (sorted[low] === target) {
        snapshots.push(snapshot(sorted, [], [low], [], `找到！目标值 ${target} 在位置 ${low}`));
        return { snapshots, result: low };
      }
      break;
    }

    // 插值公式
    const pos = low + Math.floor(((target - sorted[low]) * (high - low)) / (sorted[high] - sorted[low]));

    snapshots.push(snapshot(
      [...sorted], [pos], [], [],
      `插值估算位置 ${pos}，值 = ${sorted[pos]}，与 ${target} 比较`,
      { left: low, right: high, mid: pos }
    ));

    if (sorted[pos] === target) {
      snapshots.push(snapshot(
        [...sorted], [], [pos], [],
        `找到！目标值 ${target} 在位置 ${pos}`,
        { left: low, right: high, mid: pos }
      ));
      return { snapshots, result: pos };
    } else if (sorted[pos] < target) {
      low = pos + 1;
      snapshots.push(snapshot(
        [...sorted], [], [], [],
        `${sorted[pos]} < ${target}，搜索右侧 [${low}..${high}]`,
        { left: low, right: high, mid: pos }
      ));
    } else {
      high = pos - 1;
      snapshots.push(snapshot(
        [...sorted], [], [], [],
        `${sorted[pos]} > ${target}，搜索左侧 [${low}..${high}]`,
        { left: low, right: high, mid: pos }
      ));
    }
  }

  snapshots.push(snapshot(sorted, [], [], [], `未找到目标值 ${target}`));
  return { snapshots, result: -1 };
}

// ==================== 数学算法 ====================

/**
 * 埃拉托色尼筛法
 */
function sieveOfEratosthenes(N) {
  const snapshots = [];
  N = N || 30;
  const isPrime = new Array(N + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  const primes = [];

  // 用数字 2..N 作为展示数组
  const displayArr = [];
  for (let i = 2; i <= N; i++) displayArr.push(i);

  snapshots.push(snapshot(
    [...displayArr], [], [], [],
    `列出 2 到 ${N} 的所有素数`
  ));

  for (let p = 2; p * p <= N; p++) {
    if (isPrime[p]) {
      primes.push(p);
      snapshots.push(snapshot(
        [...displayArr], [p - 2], [], [...primes.map(x => x - 2)],
        `${p} 是素数！标记 ${p} 的所有倍数（${p * 2}, ${p * 3}...）`
      ));

      for (let m = p * p; m <= N; m += p) {
        isPrime[m] = false;
        snapshots.push(snapshot(
          [...displayArr], [p - 2], [m - 2], [...primes.map(x => x - 2)],
          `标记 ${m} 为非素数（${p} 的倍数）`
        ));
      }
    }
  }

  // 收集剩余素数
  for (let p = Math.floor(Math.sqrt(N)) + 1; p <= N; p++) {
    if (isPrime[p]) primes.push(p);
  }

  snapshots.push(snapshot(
    [...displayArr], [], [], [...primes.map(x => x - 2)],
    `筛选完成！2..${N} 中共有 ${primes.length} 个素数`
  ));

  return { snapshots, result: primes };
}

/**
 * 欧几里得算法（辗转相除法）
 */
function euclideanGCD(a, b) {
  const snapshots = [];
  a = a || 48;
  b = b || 18;

  let x = Math.max(a, b);
  let y = Math.min(a, b);

  snapshots.push({
    type: 'gcd',
    a: x, b: y,
    description: `计算 GCD(${a}, ${b})`,
    highlightA: false, highlightB: false
  });

  while (y !== 0) {
    const remainder = x % y;
    snapshots.push({
      type: 'gcd',
      a: x, b: y,
      description: `${x} ÷ ${y} = ${Math.floor(x / y)} ... 余 ${remainder}`,
      highlightA: true, highlightB: true
    });
    x = y;
    y = remainder;
    if (y !== 0) {
      snapshots.push({
        type: 'gcd',
        a: x, b: y,
        description: `继续：GCD(${x}, ${y})`,
        highlightA: false, highlightB: false
      });
    }
  }

  snapshots.push({
    type: 'gcd',
    a: x, b: 0,
    description: `余数为0！最大公约数 GCD(${a}, ${b}) = ${x}`,
    highlightA: true, highlightB: false
  });

  return { snapshots, result: x };
}

// ==================== 图算法（迷宫） ====================

/**
 * 生成简单的迷宫网格
 */
function generateMaze() {
  // 7x7 网格，1=墙 0=路
  const grid = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0]
  ];
  return { grid, start: [0, 0], end: [6, 6], rows: 7, cols: 7 };
}

/**
 * BFS 走迷宫
 */
function bfsMaze() {
  const snapshots = [];
  const { grid, start, end, rows, cols } = generateMaze();

  snapshots.push(buildGridSnapshot(grid, [], [], [], [], `BFS 迷宫寻路：从 (${start[0]},${start[1]}) 到 (${end[0]},${end[1]})`));

  const queue = [[start[0], start[1]]];
  const visited = new Set();
  const parent = {};
  visited.add(`${start[0]},${start[1]}`);
  parent[`${start[0]},${start[1]}`] = null;

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.length > 0) {
    const [r, c] = queue.shift();

    snapshots.push(buildGridSnapshot(
      grid, [...visited].map(s => s.split(',').map(Number)),
      [r, c], [], [],
      `访问节点 (${r}, ${c})`
    ));

    if (r === end[0] && c === end[1]) {
      // 重建路径
      const path = [];
      let cur = `${r},${c}`;
      while (cur) {
        path.push(cur.split(',').map(Number));
        cur = parent[cur];
      }
      path.reverse();

      snapshots.push(buildGridSnapshot(
        grid, [...visited].map(s => s.split(',').map(Number)),
        end, path, [],
        `找到目标！最短路径长度 = ${path.length - 1}`
      ));
      return { snapshots, result: path };
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !visited.has(key)) {
        visited.add(key);
        parent[key] = `${r},${c}`;
        queue.push([nr, nc]);

        snapshots.push(buildGridSnapshot(
          grid, [...visited].map(s => s.split(',').map(Number)),
          [r, c], [], [[nr, nc]],
          `发现邻居 (${nr}, ${nc})，加入队列`
        ));
      }
    }
  }

  snapshots.push(buildGridSnapshot(grid, [], [], [], [], '未找到路径'));
  return { snapshots, result: null };
}

/**
 * DFS 走迷宫
 */
function dfsMaze() {
  const snapshots = [];
  const { grid, start, end, rows, cols } = generateMaze();

  snapshots.push(buildGridSnapshot(grid, [], [], [], [], `DFS 迷宫寻路：从 (${start[0]},${start[1]}) 到 (${end[0]},${end[1]})`));

  const stack = [[start[0], start[1]]];
  const visited = new Set();
  const parent = {};
  visited.add(`${start[0]},${start[1]}`);
  parent[`${start[0]},${start[1]}`] = null;

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (stack.length > 0) {
    const [r, c] = stack.pop();

    snapshots.push(buildGridSnapshot(
      grid, [...visited].map(s => s.split(',').map(Number)),
      [r, c], [], [],
      `访问节点 (${r}, ${c})`
    ));

    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = `${r},${c}`;
      while (cur) {
        path.push(cur.split(',').map(Number));
        cur = parent[cur];
      }
      path.reverse();

      snapshots.push(buildGridSnapshot(
        grid, [...visited].map(s => s.split(',').map(Number)),
        end, path, [],
        `找到目标！路径长度 = ${path.length - 1}`
      ));
      return { snapshots, result: path };
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !visited.has(key)) {
        visited.add(key);
        parent[key] = `${r},${c}`;
        stack.push([nr, nc]);

        snapshots.push(buildGridSnapshot(
          grid, [...visited].map(s => s.split(',').map(Number)),
          [r, c], [], [[nr, nc]],
          `发现邻居 (${nr}, ${nc})，压入栈`
        ));
      }
    }
  }

  snapshots.push(buildGridSnapshot(grid, [], [], [], [], '未找到路径'));
  return { snapshots, result: null };
}

function buildGridSnapshot(grid, visited, current, path, newCells, description) {
  return {
    type: 'grid',
    grid: grid.map(r => [...r]),
    visited: visited.map(v => [...v]),
    current: [...current],
    path: path.map(p => [...p]),
    newCells: newCells.map(c => [...c]),
    rows: grid.length,
    cols: grid[0].length,
    description
  };
}

// ==================== 扩展排序算法 ====================

/**
 * 基数排序 (LSD)
 */
function radixSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  const maxVal = Math.max(...array);
  const maxDigits = String(maxVal).length;

  for (let digit = 0; digit < maxDigits; digit++) {
    const divisor = Math.pow(10, digit);
    snapshots.push(snapshot(
      [...array], [], [], [],
      `按第 ${digit + 1} 位（除数=${divisor}）进行计数排序`
    ));

    // 计数当前位
    const count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      const d = Math.floor(array[i] / divisor) % 10;
      count[d]++;
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    // 放置元素
    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      const d = Math.floor(array[i] / divisor) % 10;
      const idx = count[d] - 1;
      output[idx] = array[i];
      count[d]--;
    }

    // 复制回原数组
    for (let i = 0; i < n; i++) {
      array[i] = output[i];
    }

    snapshots.push(snapshot(
      [...array], [], [], [],
      `第 ${digit + 1} 位排序完成`
    ));
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

/**
 * 梳排序
 */
function combSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;

  snapshots.push(snapshot(array, [], [], [], '初始数组'));

  let gap = n;
  const shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    snapshots.push(snapshot(
      [...array], [], [], [],
      `gap = ${gap}，比较相隔 ${gap} 个位置的元素`
    ));

    for (let i = 0; i + gap < n; i++) {
      snapshots.push(snapshot(
        [...array], [i, i + gap], [], [],
        `比较 ${array[i]} 和 ${array[i + gap]}`
      ));
      if (array[i] > array[i + gap]) {
        [array[i], array[i + gap]] = [array[i + gap], array[i]];
        sorted = false;
        snapshots.push(snapshot(
          [...array], [], [i, i + gap], [],
          `交换 ${array[i + gap]} 和 ${array[i]}`
        ));
      }
    }
  }

  snapshots.push(snapshot([...array], [], [], allIndices(n), '排序完成！'));
  return { snapshots, result: array };
}

/**
 * 桶排序
 */
function bucketSort(arr) {
  const snapshots = [];
  const array = [...arr];
  const n = array.length;
  const min = Math.min(...array);
  const max = Math.max(...array);
  const bucketCount = Math.min(n, 6);
  const bucketRange = (max - min) / bucketCount;

  snapshots.push(snapshot(array, [], [], [], `创建 ${bucketCount} 个桶 (范围: ${min}~${max})`));

  // 分配到桶
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (let i = 0; i < n; i++) {
    let idx = Math.floor((array[i] - min) / bucketRange);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx].push(array[i]);
    snapshots.push(snapshot(
      [...array], [i], [], [],
      `将 ${array[i]} 放入桶 ${idx + 1}`
    ));
  }

  // 桶内排序
  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, b) => a - b);
    snapshots.push(snapshot(
      [...array], [], [], [],
      `桶 ${b + 1} (${buckets[b].join(', ')}) 排序完成`
    ));
  }

  // 合并
  const result = [];
  for (let b = 0; b < bucketCount; b++) {
    for (const v of buckets[b]) result.push(v);
  }
  snapshots.push(snapshot(
    [...result], [], [], allIndices(n),
    `合并所有桶，排序完成！`
  ));

  return { snapshots, result };
}

// ==================== 扩展搜索算法 ====================

/**
 * 斐波那契搜索
 */
function fibonacciSearch(arr, target) {
  const snapshots = [];
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;

  snapshots.push(snapshot(sorted, [], [], [], `开始斐波那契搜索目标值 ${target}`));

  // 构建斐波那契数列
  let fib2 = 0;   // F(k-2)
  let fib1 = 1;   // F(k-1)
  let fib = fib1 + fib2; // F(k)

  while (fib < n) {
    fib2 = fib1;
    fib1 = fib;
    fib = fib1 + fib2;
  }

  let offset = -1;

  while (fib > 1) {
    const i = Math.min(offset + fib2, n - 1);

    snapshots.push(snapshot(
      [...sorted], [i], [], [],
      `比较位置 ${i}(${sorted[i]}) 和 ${target}`,
      { left: offset + 1, right: Math.min(offset + fib, n - 1), mid: i }
    ));

    if (sorted[i] < target) {
      fib = fib1;
      fib1 = fib2;
      fib2 = fib - fib1;
      offset = i;
      snapshots.push(snapshot(
        [...sorted], [], [], [],
        `${sorted[i]} < ${target}，向右搜索 [${offset + 1}..]`,
        { left: offset + 1, right: Math.min(offset + fib, n - 1), mid: -1 }
      ));
    } else if (sorted[i] > target) {
      fib = fib2;
      fib1 = fib1 - fib2;
      fib2 = fib - fib1;
      snapshots.push(snapshot(
        [...sorted], [], [], [],
        `${sorted[i]} > ${target}，向左搜索 [..${i - 1}]`,
        { left: offset + 1, right: i - 1, mid: -1 }
      ));
    } else {
      snapshots.push(snapshot([...sorted], [], [i], [], `找到！目标值 ${target} 在位置 ${i}`));
      return { snapshots, result: i };
    }
  }

  if (fib1 && sorted[offset + 1] === target) {
    const i = offset + 1;
    snapshots.push(snapshot([...sorted], [], [i], [], `找到！目标值 ${target} 在位置 ${i}`));
    return { snapshots, result: i };
  }

  snapshots.push(snapshot(sorted, [], [], [], `未找到目标值 ${target}`));
  return { snapshots, result: -1 };
}

// ==================== DP / 数学算法 ====================

/**
 * 斐波那契 DP
 */
function fibonacciDP(N) {
  const snapshots = [];
  N = N || 10;
  const dp = new Array(N + 1).fill(0);
  dp[0] = 0;
  if (N >= 1) dp[1] = 1;

  snapshots.push(snapshot(
    [...dp].map((v, i) => i <= 1 ? v : 0), [], [0, 1], [],
    `F(0)=0, F(1)=1，开始计算 F(2)~F(${N})`
  ));

  for (let i = 2; i <= N; i++) {
    snapshots.push(snapshot(
      [...dp], [i - 2, i - 1], [], Array.from({ length: i }, (_, j) => j),
      `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]}`
    ));
    dp[i] = dp[i - 1] + dp[i - 2];
    snapshots.push(snapshot(
      [...dp], [], [i], Array.from({ length: i + 1 }, (_, j) => j),
      `F(${i}) = ${dp[i]}`
    ));
  }

  snapshots.push(snapshot(
    dp, [], [], allIndices(N + 1),
    `计算完成！F(${N}) = ${dp[N]}`
  ));

  return { snapshots, result: dp[N] };
}

/**
 * 0/1 背包问题
 */
function knapsack01(config) {
  const snapshots = [];
  config = config || {};
  const weights = config.weights || [2, 3, 4];   // 3个物品，更易理解
  const values = config.values || [3, 4, 5];
  const capacity = config.capacity || 5;           // 较小容量
  const n = weights.length;

  const itemNames = weights.map((w, i) => `物品${i + 1}`);
  const itemsArray = weights.map((w, i) => ({ name: itemNames[i], weight: w, value: values[i] }));

  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  snapshots.push({
    type: 'table',
    headers: ['物品\\容量', ...Array.from({ length: capacity + 1 }, (_, i) => String(i))],
    rows: buildTableRows(dp, 0, n + 1),
    highlight: { row: 0, col: 1, fromA: null, fromB: null },
    items: itemsArray, currentItem: 0,
    description: `0/1背包：${n}个物品，背包容量${capacity}kg`
  });

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];

    for (let j = 0; j <= capacity; j++) {
      const fromA = { row: i - 1, col: j + 1, label: '不选(继承)' };

      if (w > j) {
        dp[i][j] = dp[i - 1][j];
        snapshots.push({
          type: 'table',
          headers: ['物品\\容量', ...Array.from({ length: capacity + 1 }, (_, k) => String(k))],
          rows: buildTableRows(dp, i, n + 1),
          highlight: { row: i, col: j + 1, fromA, fromB: null },
          items: itemsArray, currentItem: i,
          description: `物品${i}(${w}kg/${v}元) 太重装不下 → 继承上方 ${dp[i][j]}元`
        });
      } else {
        const skip = dp[i - 1][j];
        const take = dp[i - 1][j - w] + v;
        const fromB = { row: i - 1, col: j - w + 1, label: '选(腾空间)' };
        dp[i][j] = Math.max(skip, take);

        const chosen = skip >= take ? '不选更优' : '放入更优';
        snapshots.push({
          type: 'table',
          headers: ['物品\\容量', ...Array.from({ length: capacity + 1 }, (_, k) => String(k))],
          rows: buildTableRows(dp, i, n + 1),
          highlight: { row: i, col: j + 1, fromA, fromB },
          items: itemsArray, currentItem: i,
          description: `物品${i}(${w}kg/${v}元)：不选${skip}元 vs 放入${v}+${dp[i-1][j-w]}=${take}元 → ${chosen}，取${dp[i][j]}元`
        });
      }
    }
  }

  snapshots.push({
    type: 'table',
    headers: ['物品\\容量', ...Array.from({ length: capacity + 1 }, (_, k) => String(k))],
    rows: buildTableRows(dp, n, n + 1),
    highlight: { row: n, col: capacity + 1, fromA: null, fromB: null },
    items: itemsArray, currentItem: n + 1,
    description: `✅ 最优解：装入背包的最大价值 = ${dp[n][capacity]} 元`
  });

  return { snapshots, result: dp[n][capacity] };
}

function buildTableRows(dp, maxRow, totalRows) {
  const rows = [];
  for (let i = 0; i < totalRows; i++) {
    if (i <= maxRow) {
      rows.push([`物品${i}`.replace('物品0', '初始'), ...dp[i].map(String)]);
    } else {
      rows.push([]); // 隐藏未计算行
    }
  }
  return rows;
}

/**
 * 快速幂
 */
function fastPower(a, n) {
  const snapshots = [];
  a = a || 2;
  n = n || 13;

  let base = a;
  let exp = n;
  let result = 1;

  snapshots.push({
    type: 'fastpower',
    base, exp, result,
    description: `计算 ${a}^${n}，初始化 result=1`
  });

  while (exp > 0) {
    if (exp % 2 === 1) {
      const oldResult = result;
      result = result * base;
      snapshots.push({
        type: 'fastpower',
        base, exp, result,
        description: `指数 ${exp} 为奇数，result = ${oldResult} × ${base} = ${result}`
      });
    }
    exp = Math.floor(exp / 2);
    const oldBase = base;
    base = base * base;
    snapshots.push({
      type: 'fastpower',
      base, exp, result,
      description: `底数平方 ${oldBase}² = ${base}，指数折半 → ${exp}`
    });
  }

  snapshots.push({
    type: 'fastpower',
    base, exp, result,
    description: `结果：${a}^${n} = ${result}`
  });

  return { snapshots, result };
}

// ==================== 工具函数 ====================

function snapshot(array, comparing, swapping, sorted, description, _searchMeta) {
  return {
    type: 'array',
    array: [...array],
    comparing: [...comparing],
    swapping: [...swapping],
    sorted: [...sorted],
    description,
    searchMeta: _searchMeta || null
  };
}

function sortedRange(start, end) {
  const indices = [];
  for (let i = start; i < end; i++) indices.push(i);
  return indices;
}

function allIndices(n) {
  return sortedRange(0, n);
}

/**
 * 生成指定长度的随机数组
 */
function generateRandomArray(length = 10, min = 1, max = 50) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return arr;
}

/**
 * 根据算法ID执行对应算法
 * @param {string} algoId 算法ID
 * @param {Array} arr 数组参数（可选，部分算法不需要）
 * @param {*} extra 额外参数（搜索算法的target、筛法的N、GCD的第二个数等）
 */
function executeAlgorithm(algoId, arr, extra) {
  switch (algoId) {
    case 'bubble':         return bubbleSort(arr);
    case 'selection':      return selectionSort(arr);
    case 'insertion':      return insertionSort(arr);
    case 'shell':          return shellSort(arr);
    case 'cocktail':       return cocktailSort(arr);
    case 'counting':       return countingSort(arr);
    case 'radix':          return radixSort(arr);
    case 'comb':           return combSort(arr);
    case 'bucket':         return bucketSort(arr);
    case 'quick':          return quickSort(arr);
    case 'merge':          return mergeSort(arr);
    case 'heap':           return heapSort(arr);
    case 'linear':         return linearSearch(arr, extra);
    case 'binary':         return binarySearch(arr, extra);
    case 'jump':           return jumpSearch(arr, extra);
    case 'interpolation':  return interpolationSearch(arr, extra);
    case 'fibonacciSearch': return fibonacciSearch(arr, extra);
    case 'fibdp':          return fibonacciDP(extra || 10);
    case 'knapsack':       return knapsack01(null);
    case 'sieve':          return sieveOfEratosthenes(extra || 30);
    case 'gcd':            return euclideanGCD(arr || 48, extra || 18);
    case 'fastpower':      return fastPower(arr || 2, extra || 13);
    case 'bfs':            return bfsMaze();
    case 'dfs':            return dfsMaze();
    case 'stack':          return stackDemo();
    case 'queue':          return queueDemo();
    default:               return null;
  }
}

module.exports = {
  bubbleSort, selectionSort, insertionSort,
  shellSort, cocktailSort, countingSort,
  radixSort, combSort, bucketSort,
  quickSort, mergeSort, heapSort,
  linearSearch, binarySearch,
  jumpSearch, interpolationSearch, fibonacciSearch,
  fibonacciDP, knapsack01,
  sieveOfEratosthenes, euclideanGCD, fastPower,
  bfsMaze, dfsMaze,
  stackDemo, queueDemo,
  generateRandomArray,
  executeAlgorithm
};
