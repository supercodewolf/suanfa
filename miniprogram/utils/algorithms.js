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
 */
function executeAlgorithm(algoId, arr, target) {
  switch (algoId) {
    case 'bubble':    return bubbleSort(arr);
    case 'selection': return selectionSort(arr);
    case 'insertion': return insertionSort(arr);
    case 'quick':     return quickSort(arr);
    case 'merge':     return mergeSort(arr);
    case 'heap':      return heapSort(arr);
    case 'linear':    return linearSearch(arr, target);
    case 'binary':    return binarySearch(arr, target);
    case 'stack':     return stackDemo();
    case 'queue':     return queueDemo();
    default:          return null;
  }
}

module.exports = {
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  heapSort,
  linearSearch,
  binarySearch,
  stackDemo,
  queueDemo,
  generateRandomArray,
  executeAlgorithm
};
