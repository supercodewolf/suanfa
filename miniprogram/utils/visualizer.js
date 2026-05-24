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
      found: '#27AE60'        // 查找结果
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
