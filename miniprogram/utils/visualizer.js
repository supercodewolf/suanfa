/**
 * Canvas 可视化绘图工具
 * 负责将所有算法快照绘制到 Canvas 上
 */

class Visualizer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.dpr = 2; // 设备像素比，用于高清屏适配

    // 颜色定义
    this.colors = {
      default: '#4A90D9',     // 蓝色 - 默认
      comparing: '#F5A623',   // 黄色 - 正在比较
      swapping: '#E74C3C',    // 红色 - 正在交换/操作
      sorted: '#27AE60',      // 绿色 - 已排序/已找到
      pivot: '#9B59B6',       // 紫色 - 基准元素
      range: '#E67E22',       // 橙色 - 搜索范围
      text: '#2C3E50',        // 深色文字
      desc: '#7F8C8D',        // 灰色描述
      bg: '#FFFFFF',          // 背景
      barBg: '#34495E',       // 柱子文字
      found: '#27AE60',       // 查找结果
      wall: '#2C3E50',        // 迷宫墙
      path: '#F1C40F',        // 迷宫路径
      visited: '#BDC3C7',     // 已访问
      empty: '#ECF0F1'        // 空地
    };
  }

  /**
   * 主入口：根据快照类型调用不同绘制方法
   */
  draw(snapshot) {
    if (!snapshot) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 背景
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    if (snapshot.type === 'array') {
      this.drawArraySnapshot(snapshot);
    } else if (snapshot.type === 'stack') {
      this.drawStackSnapshot(snapshot);
    } else if (snapshot.type === 'queue') {
      this.drawQueueSnapshot(snapshot);
    } else if (snapshot.type === 'grid') {
      this.drawGridSnapshot(snapshot);
    } else if (snapshot.type === 'gcd') {
      this.drawGcdSnapshot(snapshot);
    } else if (snapshot.type === 'table') {
      this.drawTableSnapshot(snapshot);
    } else if (snapshot.type === 'fastpower') {
      this.drawFastPowerSnapshot(snapshot);
    }

    // 底部描述文字
    this.drawDescription(snapshot.description || snapshot.action || '');
  }

  /**
   * 绘制数组快照（排序、搜索通用）
   */
  drawArraySnapshot(snapshot) {
    const { array, comparing, swapping, sorted, searchMeta, description } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (!array || array.length === 0) return;

    const padding = { top: 30, right: 30, bottom: 70, left: 30 };
    const barCount = array.length;
    const barGap = 6;
    const barAreaWidth = w - padding.left - padding.right;
    const barWidth = Math.min(50, (barAreaWidth - barGap * (barCount - 1)) / barCount);
    const totalBarsWidth = barWidth * barCount + barGap * (barCount - 1);
    const offsetX = (barAreaWidth - totalBarsWidth) / 2;

    const maxVal = Math.max(...array);
    const chartHeight = h - padding.top - padding.bottom - 20;

    // 绘制搜索范围背景（仅二分搜索用）
    if (searchMeta && searchMeta.left !== undefined) {
      const leftX = padding.left + offsetX + searchMeta.left * (barWidth + barGap);
      const rightX = padding.left + offsetX + searchMeta.right * (barWidth + barGap) + barWidth;
      const midX = padding.left + offsetX + searchMeta.mid * (barWidth + barGap);

      ctx.fillStyle = 'rgba(230, 126, 34, 0.1)';
      ctx.fillRect(leftX, padding.top, rightX - leftX, chartHeight);

      ctx.fillStyle = 'rgba(155, 89, 182, 0.15)';
      ctx.fillRect(midX - 2, padding.top, barWidth + 4, chartHeight);
    }

    // 绘制柱子
    array.forEach((val, i) => {
      const barHeight = Math.max(10, (val / maxVal) * chartHeight);
      const x = padding.left + offsetX + i * (barWidth + barGap);
      const y = padding.top + chartHeight - barHeight;

      // 圆角矩形路径
      const radius = 4;
      this.roundRect(x, y, barWidth, barHeight, radius);

      if (sorted.includes(i)) {
        ctx.fillStyle = this.colors.sorted;
      } else if (swapping.includes(i)) {
        ctx.fillStyle = this.colors.swapping;
      } else if (comparing.includes(i)) {
        ctx.fillStyle = this.colors.comparing;
      } else if (searchMeta && searchMeta.mid === i) {
        ctx.fillStyle = this.colors.pivot;
      } else {
        ctx.fillStyle = this.colors.default;
      }
      ctx.fill();

      // 顶部数值
      ctx.fillStyle = this.colors.barBg;
      ctx.font = `bold ${Math.min(14, barWidth * 0.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(val, x + barWidth / 2, y - 4);

      // 底部索引
      ctx.fillStyle = '#95A5A6';
      ctx.font = '10px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(i, x + barWidth / 2, padding.top + chartHeight + 6);
    });
  }

  /**
   * 绘制栈快照
   */
  drawStackSnapshot(snapshot) {
    const { array, top, highlight } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (!array) return;

    const padding = { top: 30, right: 60, left: 60, bottom: 70 };
    const boxWidth = 100;
    const boxHeight = 36;
    const gap = 4;
    const maxVisible = 9;

    const displayArr = array.length > maxVisible
      ? [...array.slice(array.length - maxVisible)]
      : [...array];
    const startX = w / 2 - boxWidth / 2;
    const totalH = Math.max(displayArr.length, 1) * (boxHeight + gap) - gap;
    const startY = padding.top + (h - padding.top - padding.bottom - totalH) / 2;

    // 标题 "栈顶 ↓"
    ctx.fillStyle = '#E74C3C';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('栈顶 ↓', w / 2, startY - 8);

    // 绘制元素
    for (let i = displayArr.length - 1; i >= 0; i--) {
      const y = startY + (displayArr.length - 1 - i) * (boxHeight + gap);
      const isTop = (array.length > maxVisible ? array.length - maxVisible + i : i) === top;
      const isHighlight = (array.length > maxVisible ? array.length - maxVisible + i : i) === highlight;

      this.roundRect(startX, y, boxWidth, boxHeight, 6);

      if (isHighlight && isTop) {
        ctx.fillStyle = '#27AE60';
        ctx.strokeStyle = '#1E8449';
      } else if (isTop) {
        ctx.fillStyle = '#4A90D9';
        ctx.strokeStyle = '#2E6EB5';
      } else {
        ctx.fillStyle = '#ECF0F1';
        ctx.strokeStyle = '#BDC3C7';
      }
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // 文字
      const realIdx = array.length > maxVisible ? array.length - maxVisible + i : i;
      ctx.fillStyle = (isTop || isHighlight) ? '#FFFFFF' : '#2C3E50';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(array[realIdx], startX + boxWidth / 2, y + boxHeight / 2);
    }

    // 显示隐藏的元素数量
    if (array.length > maxVisible) {
      ctx.fillStyle = '#95A5A6';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`... 还有 ${array.length - maxVisible} 个元素`, w / 2, startY + totalH + 4);
    }
  }

  /**
   * 绘制队列快照
   */
  drawQueueSnapshot(snapshot) {
    const { array, front, rear, highlight } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (!array) return;

    const padding = { top: 30, right: 40, left: 40, bottom: 70 };
    const boxWidth = 60;
    const boxHeight = 36;
    const gap = 6;
    const maxVisible = 7;

    const displayArr = array.length > maxVisible ? array.slice(0, maxVisible) : array;
    const totalW = displayArr.length * (boxWidth + gap) - gap;
    const startX = w / 2 - totalW / 2;
    const startY = (h - padding.top - padding.bottom - boxHeight) / 2 + padding.top;

    // 队头/队尾标签
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    if (displayArr.length > 0) {
      ctx.fillStyle = '#27AE60';
      ctx.fillText('队头 ↓', startX + boxWidth / 2, startY - 8);
      ctx.fillStyle = '#E74C3C';
      ctx.fillText('队尾 ↓', startX + totalW - boxWidth / 2, startY - 8);
    }

    // 箭头
    if (displayArr.length > 0) {
      ctx.fillStyle = '#BDC3C7';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('→', startX - 8, startY + boxHeight / 2 - 8);
      if (displayArr.length > 1) {
        ctx.fillText('→', startX + totalW + 4, startY + boxHeight / 2 - 8);
      }
    }

    // 绘制元素
    for (let i = 0; i < displayArr.length; i++) {
      const x = startX + i * (boxWidth + gap);
      const isFront = i === front;
      const isRear = i === rear;
      const isHighlight = i === highlight;

      this.roundRect(x, startY, boxWidth, boxHeight, 6);

      if (isHighlight && isFront) {
        ctx.fillStyle = '#27AE60';
        ctx.strokeStyle = '#1E8449';
      } else if (isHighlight && isRear) {
        ctx.fillStyle = '#E74C3C';
        ctx.strokeStyle = '#C0392B';
      } else if (isFront) {
        ctx.fillStyle = '#4A90D9';
        ctx.strokeStyle = '#2E6EB5';
      } else if (isRear) {
        ctx.fillStyle = '#E67E22';
        ctx.strokeStyle = '#D35400';
      } else {
        ctx.fillStyle = '#ECF0F1';
        ctx.strokeStyle = '#BDC3C7';
      }
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = (isFront || isRear || isHighlight) ? '#FFFFFF' : '#2C3E50';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(array[i], x + boxWidth / 2, startY + boxHeight / 2);
    }

    // 隐藏元素提示
    if (array.length > maxVisible) {
      ctx.fillStyle = '#95A5A6';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`... 还有 ${array.length - maxVisible} 个元素`, w / 2, startY + boxHeight + 4);
    }
  }

  /**
   * 绘制迷宫网格快照（BFS/DFS）
   */
  drawGridSnapshot(snapshot) {
    const { grid, visited, current, path, newCells, rows, cols } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const padding = { top: 30, right: 30, bottom: 70, left: 30 };
    const areaW = w - padding.left - padding.right;
    const areaH = h - padding.top - padding.bottom;
    const cellSize = Math.min(Math.floor(areaW / cols), Math.floor(areaH / rows));
    const gridW = cellSize * cols;
    const gridH = cellSize * rows;
    const offsetX = padding.left + (areaW - gridW) / 2;
    const offsetY = padding.top + (areaH - gridH) / 2;

    const visitedSet = new Set(visited.map(([r, c]) => `${r},${c}`));
    const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
    const newSet = new Set(newCells.map(([r, c]) => `${r},${c}`));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellSize;
        const y = offsetY + r * cellSize;
        const key = `${r},${c}`;

        // 填充颜色
        if (r === current[0] && c === current[1]) {
          ctx.fillStyle = '#E74C3C';  // 当前位置：红色
        } else if (pathSet.has(key)) {
          ctx.fillStyle = this.colors.path;  // 路径：金色
        } else if (newSet.has(key)) {
          ctx.fillStyle = '#3498DB';  // 新发现：蓝色
        } else if (visitedSet.has(key)) {
          ctx.fillStyle = this.colors.visited;  // 已访问：灰色
        } else if (grid[r][c] === 1) {
          ctx.fillStyle = this.colors.wall;  // 墙：深色
        } else {
          ctx.fillStyle = this.colors.empty;  // 空地：浅色
        }

        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // 起点/终点标记
        if ((r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `${cellSize * 0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(r === 0 ? 'S' : 'E', x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  }

  /**
   * 绘制 GCD 快照
   */
  drawGcdSnapshot(snapshot) {
    const { a, b, highlightA, highlightB } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const centerY = (h - 70) / 2;
    const boxW = 120, boxH = 60, gap = 80;
    const totalW = boxW * 2 + gap;
    const startX = w / 2 - totalW / 2;

    // 标签
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('较大数', startX + boxW / 2, centerY - 70);
    ctx.fillText('较小数', startX + boxW + gap + boxW / 2, centerY - 70);

    // 变量 a
    this.roundRect(startX, centerY - boxH / 2, boxW, boxH, 12);
    ctx.fillStyle = highlightA ? '#E74C3C' : '#4A90D9';
    ctx.lineWidth = 3;
    ctx.strokeStyle = highlightA ? '#C0392B' : '#2E6EB5';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a || 0, startX + boxW / 2, centerY);

    // 等号/箭头
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '24px sans-serif';
    ctx.fillText('?', startX + boxW + gap / 2, centerY);

    // 变量 b
    this.roundRect(startX + boxW + gap, centerY - boxH / 2, boxW, boxH, 12);
    ctx.fillStyle = highlightB ? '#E74C3C' : '#27AE60';
    ctx.lineWidth = 3;
    ctx.strokeStyle = highlightB ? '#C0392B' : '#1E8449';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(b || 0, startX + boxW + gap + boxW / 2, centerY);

    // 标签 "a" / "b"
    ctx.fillStyle = '#95A5A6';
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText('a', startX + boxW - 10, centerY - boxH / 2 - 2);
    ctx.fillText('b', startX + boxW + gap + 10, centerY - boxH / 2 - 2);
  }

  /**
   * 绘制 DP 表格快照（背包问题）
   */
  drawTableSnapshot(snapshot) {
    const { headers, rows, highlight, items, currentItem } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const itemAreaH = items ? 50 : 0;
    const padding = { top: itemAreaH + 10, right: 20, bottom: 70, left: 20 };
    const cols = headers.length;
    const visibleRows = rows.filter(r => r.length > 0);
    const cellW = Math.min(48, (w - padding.left - padding.right) / cols);
    const cellH = 22;
    const totalW = cellW * cols;
    const offsetX = padding.left + (w - padding.left - padding.right - totalW) / 2;
    const offsetY = padding.top + 10;

    // 绘制物品展示栏
    if (items) {
      const itemW = Math.min(90, (w - 40) / items.length - 8);
      const startX = w / 2 - (items.length * (itemW + 8)) / 2;
      for (let i = 0; i < items.length; i++) {
        const ix = startX + i * (itemW + 8);
        const isCurrent = currentItem === i + 1;

        ctx.fillStyle = isCurrent ? '#E74C3C' : '#4A90D9';
        this.roundRect(ix, 8, itemW, 36, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(items[i].name, ix + itemW / 2, 16);
        ctx.font = '9px sans-serif';
        ctx.fillText(`${items[i].weight}kg/${items[i].value}元`, ix + itemW / 2, 33);

        if (isCurrent) {
          // 红色边框 + 箭头
          ctx.strokeStyle = '#E74C3C';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.lineWidth = 1;
          // 小箭头指向表格
          ctx.fillStyle = '#E74C3C';
          ctx.fillText('▼', ix + itemW / 2, 48);
        }
      }
    }

    // 绘制关联高亮（fromA / fromB 的数据源格子）
    const highlightCells = [];
    if (highlight) {
      if (highlight.fromA) highlightCells.push({ ...highlight.fromA, color: '#3498DB', type: 'skip' });
      if (highlight.fromB) highlightCells.push({ ...highlight.fromB, color: '#F39C12', type: 'take' });
      highlightCells.push({ row: highlight.row, col: highlight.col, color: '#E74C3C', type: 'current' });
    }

    // 先画来源格子的半透明背景
    for (const hc of highlightCells) {
      if (hc.type === 'current') continue;
      const sr = hc.row, sc = hc.col;
      if (sr < visibleRows.length && sc < cols) {
        const hx = offsetX + sc * cellW;
        const hy = offsetY + cellH + sr * cellH;
        ctx.fillStyle = hc.color === '#3498DB' ? 'rgba(52,152,219,0.25)' : 'rgba(243,156,18,0.25)';
        ctx.fillRect(hx, hy, cellW, cellH);
        // 小标签
        ctx.fillStyle = hc.color;
        ctx.font = '7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(hc.label, hx + cellW / 2, hy - 1);
      }
    }

    // 表头
    ctx.fillStyle = '#34495E';
    ctx.fillRect(offsetX, offsetY, totalW, cellH);
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * cellW;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(headers[c], x + cellW / 2, offsetY + cellH / 2);
    }

    // 数据行
    for (let r = 0; r < visibleRows.length; r++) {
      const row = visibleRows[r];
      const isCurrentRow = highlight && highlight.row === r;
      const baseY = offsetY + cellH + r * cellH;

      // 当前行背景
      if (isCurrentRow) {
        ctx.fillStyle = 'rgba(231,76,60,0.06)';
        ctx.fillRect(offsetX, baseY, totalW, cellH);
      }

      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellW;
        const y = baseY;

        // 判断此格子的高亮类型
        let cellHighlight = null;
        for (const hc of highlightCells) {
          if (hc.row === r && hc.col === c) { cellHighlight = hc; break; }
        }

        if (cellHighlight) {
          ctx.fillStyle = cellHighlight.color;
          if (cellHighlight.type !== 'current') {
            // 来源格用半透明
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = cellHighlight.color;
            ctx.fillRect(x, y, cellW, cellH);
            ctx.globalAlpha = 1;
          } else {
            ctx.fillRect(x, y, cellW, cellH);
          }
        } else if (r % 2 === 0) {
          ctx.fillStyle = '#F8F9FA';
          ctx.fillRect(x, y, cellW, cellH);
        } else {
          ctx.fillRect(x, y, cellW, cellH);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, y, cellW, cellH);
        }

        ctx.strokeStyle = '#E8E8E8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellW, cellH);

        ctx.fillStyle = cellHighlight && cellHighlight.type === 'current' ? '#FFFFFF' : '#2C3E50';
        ctx.font = `${cellHighlight && cellHighlight.type === 'current' ? 'bold ' : ''}10px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(row[c] || '', x + cellW / 2, y + cellH / 2);
      }
    }

    // 图例
    const legendY = offsetY + cellH + visibleRows.length * cellH + 8;
    const legendItems = [
      { color: '#E74C3C', label: '当前格' },
      { color: '#3498DB', label: '不选来源' },
      { color: '#F39C12', label: '放入来源' }
    ];
    const legendStart = offsetX;
    for (let i = 0; i < legendItems.length; i++) {
      const lx = legendStart + i * 90;
      ctx.fillStyle = legendItems[i].color;
      ctx.fillRect(lx, legendY, 10, 10);
      ctx.fillStyle = '#7F8C8D';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(legendItems[i].label, lx + 14, legendY + 5);
    }
  }

  /**
   * 绘制快速幂快照
   */
  drawFastPowerSnapshot(snapshot) {
    const { base, exp, result, total, action, prevBase, prevExp, prevResult } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 顶部公式
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(total || `${base}^${exp}`, w / 2, 12);

    // 如果完成，大号显示结果
    if (action === 'done') {
      ctx.fillStyle = '#27AE60';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`= ${result}`, w / 2, 38);
      ctx.textBaseline = 'middle';
    } else {
      ctx.fillStyle = '#95A5A6';
      ctx.font = '13px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('正在转化中...', w / 2, 36);
    }

    const centerY = (h - 60) / 2 + 20;
    const boxW = 100, boxH = 52, gap = 24;
    const totalW = boxW * 3 + gap * 2;
    const startX = w / 2 - totalW / 2;

    const boxDefs = [
      { label: '底数 base',  value: base,   color: '#4A90D9', prev: prevBase,  change: base !== prevBase },
      { label: '指数 exp',  value: exp,     color: '#E67E22', prev: prevExp,   change: exp !== prevExp },
      { label: '结果 result', value: result, color: '#27AE60', prev: prevResult, change: result !== prevResult }
    ];

    for (let i = 0; i < 3; i++) {
      const def = boxDefs[i];
      const x = startX + i * (boxW + gap);

      // 变化箭头（旧值 → 新值）
      if (def.change && def.prev !== undefined) {
        ctx.fillStyle = '#E74C3C';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${def.prev} →`, x + boxW / 2, centerY - boxH / 2 - 26);
      }

      // 标签
      ctx.fillStyle = '#95A5A6';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(def.label, x + boxW / 2, centerY - boxH / 2 - 8);

      // 框
      const glow = def.change || (action === 'odd_mult' && i === 2) || (action === 'square_halve' && i <= 1);
      this.roundRect(x, centerY - boxH / 2, boxW, boxH, 10);

      if (glow) {
        ctx.fillStyle = def.color;
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = def.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 值
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(def.value), x + boxW / 2, centerY);
    }

    // 操作指示条
    const opColors = {
      init: { bg: '#7F8C8D', text: '开始', icon: '▶' },
      odd_mult: { bg: '#E74C3C', text: '指数是奇数 → result × base', icon: '✕' },
      square_halve: { bg: '#3498DB', text: '底数平方 + 指数折半', icon: '²' },
      done_halve: { bg: '#27AE60', text: '底数平方 + 指数归零 → 得出答案', icon: '✓' },
      done: { bg: '#27AE60', text: '计算完成', icon: '★' }
    };

    const op = opColors[action] || opColors.init;
    const opY = centerY + boxH / 2 + 16;
    const opW = 220, opH = 24;
    const opX = w / 2 - opW / 2;

    this.roundRect(opX, opY, opW, opH, 12);
    ctx.fillStyle = op.bg;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${op.icon} ${op.text}`, w / 2, opY + opH / 2);
  }

  /**
   * 底部描述区域
   */
  drawDescription(text) {
    if (!text) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#2C3E50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // 自动换行：根据 canvas 宽度拆分多行
    const maxWidth = this.width - 40;
    ctx.font = '13px sans-serif';
    const lines = [];
    let line = '';
    for (const ch of text) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line.length > 0) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const lineHeight = 18;
    const startY = this.height - 10 - (lines.length - 1) * lineHeight;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], this.width / 2, startY + i * lineHeight);
    }
  }

  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

module.exports = { Visualizer };
