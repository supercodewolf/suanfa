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
    const { headers, rows, highlight } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const padding = { top: 20, right: 20, bottom: 70, left: 20 };
    const cols = headers.length;
    const visibleRows = rows.filter(r => r.length > 0);
    const visibleRowCount = Math.max(visibleRows.length, 1);
    const cellW = Math.min(48, (w - padding.left - padding.right) / cols);
    const cellH = 24;
    const totalW = cellW * cols;
    const offsetX = padding.left + (w - padding.left - padding.right - totalW) / 2;
    const offsetY = padding.top + 10;

    // 表头
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * cellW;
      ctx.fillStyle = '#2C3E50';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(headers[c], x + cellW / 2, offsetY + cellH / 2);
    }

    // 数据行
    for (let r = 0; r < visibleRows.length; r++) {
      const row = visibleRows[r];
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellW;
        const y = offsetY + cellH + r * cellH;
        const isHighlight = highlight && highlight.row === r && highlight.col === c;

        ctx.fillStyle = isHighlight ? '#E74C3C' : (r % 2 === 0 ? '#FFFFFF' : '#F0F2F5');
        ctx.fillRect(x, y, cellW, cellH);
        ctx.strokeStyle = '#E0E0E0';
        ctx.strokeRect(x, y, cellW, cellH);

        ctx.fillStyle = isHighlight ? '#FFFFFF' : '#2C3E50';
        ctx.font = `${isHighlight ? 'bold ' : ''}10px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(row[c] || '', x + cellW / 2, y + cellH / 2);
      }
    }
  }

  /**
   * 绘制快速幂快照
   */
  drawFastPowerSnapshot(snapshot) {
    const { base, exp, result } = snapshot;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const centerY = (h - 70) / 2;
    const boxW = 100, boxH = 50, gap = 30;
    const totalW = boxW * 3 + gap * 2;
    const startX = w / 2 - totalW / 2;

    const labels = ['底数 base', '指数 exp', '结果 result'];
    const values = [String(base), String(exp), String(result)];
    const colors = ['#4A90D9', '#E67E22', '#27AE60'];

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (boxW + gap);

      // 标签
      ctx.fillStyle = '#95A5A6';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(labels[i], x + boxW / 2, centerY - boxH / 2 - 8);

      // 框
      this.roundRect(x, centerY - boxH / 2, boxW, boxH, 10);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.stroke();

      // 值
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(values[i], x + boxW / 2, centerY);
    }
  }

  /**
   * 底部描述区域
   */
  drawDescription(text) {
    if (!text) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#2C3E50';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, this.width / 2, this.height - 12);
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
