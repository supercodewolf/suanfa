const { getAlgorithmById } = require('../../data/algorithmMeta');
const { executeAlgorithm, generateRandomArray } = require('../../utils/algorithms');
const { Visualizer } = require('../../utils/visualizer');

Page({
  data: {
    algorithm: {},
    currentStep: 0,
    totalSteps: 0,
    progressPercent: 0,
    isPlaying: false,
    speed: 1,
    speeds: [1, 2, 5, 10],
    speedIndex: 0
  },

  snapshots: [],
  visualizer: null,
  timer: null,
  algoId: '',

  onLoad(options) {
    const { id } = options;
    const result = getAlgorithmById(id);

    if (!result) {
      wx.showToast({ title: '算法不存在', icon: 'error' });
      wx.navigateBack();
      return;
    }

    const { algorithm } = result;
    wx.setNavigationBarTitle({ title: algorithm.name });
    this.setData({ algorithm });
    this.algoId = id;
  },

  onReady() {
    // 页面首次渲染完成后，canvas 才有真实的 CSS 尺寸
    this.initCanvas();
  },

  onUnload() {
    this.stopPlay();
  },

  // ==================== Canvas 初始化 ====================

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#vizCanvas').boundingClientRect();
    query.select('#vizCanvas').fields({ node: true });
    query.exec((res) => {
      const rect = res[0];   // boundingClientRect 结果
      const node = res[1];   // fields 结果
      if (!rect || !rect.width || !node || !node.node) {
        console.error('Canvas 初始化失败', res);
        wx.showToast({ title: 'Canvas 加载失败', icon: 'error' });
        return;
      }

      const dpr = wx.getSystemInfoSync().pixelRatio;
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      const canvas = node.node;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      this.visualizer = new Visualizer(ctx, w, h);
      this.runAlgorithm(this.algoId);
    });
  },

  // ==================== 算法执行 ====================

  runAlgorithm(algoId) {
    const searchAlgos = ['linear', 'binary', 'jump', 'interpolation', 'fibonacciSearch'];
    const sortAlgos = ['bubble', 'selection', 'insertion', 'shell', 'cocktail', 'quick', 'merge', 'heap', 'counting', 'radix', 'comb', 'bucket'];
    const structAlgos = ['stack', 'queue'];
    const mathAlgos = ['sieve', 'gcd', 'fastpower'];
    const graphAlgos = ['bfs', 'dfs'];
    const dpAlgos = ['fibdp', 'knapsack'];

    let arr, extra;

    if (searchAlgos.includes(algoId)) {
      if (['binary', 'jump', 'interpolation', 'fibonacciSearch'].includes(algoId)) {
        arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 1).sort((a, b) => a - b);
      } else {
        arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 1);
      }
      extra = arr[Math.floor(Math.random() * arr.length)];
      wx.showToast({ title: '搜索目标: ' + extra, icon: 'none', duration: 1500 });
    } else if (sortAlgos.includes(algoId)) {
      arr = generateRandomArray(12, 2, 40);
    } else if (structAlgos.includes(algoId)) {
      arr = [];
    } else if (dpAlgos.includes(algoId)) {
      arr = [];
      if (algoId === 'fibdp') extra = 10;
    } else if (mathAlgos.includes(algoId)) {
      if (algoId === 'sieve') {
        extra = 30;
      } else if (algoId === 'fastpower') {
        arr = 2; extra = 5;
      } else {
        arr = 48; extra = 18;
      }
    } else if (graphAlgos.includes(algoId)) {
      arr = [];
    }

    try {
      const result = executeAlgorithm(algoId, arr, extra);
      if (result && result.snapshots) {
        this.snapshots = result.snapshots;
        this.setData({
          currentStep: 0,
          totalSteps: result.snapshots.length,
          progressPercent: 0
        });
        this.drawStep(0);
      }
    } catch (err) {
      console.error('算法执行失败:', err);
      wx.showToast({ title: '算法执行出错', icon: 'error' });
    }
  },

  // ==================== Canvas 绘制 ====================

  drawStep(step) {
    if (!this.visualizer || !this.snapshots[step]) return;
    this.visualizer.draw(this.snapshots[step]);

    const progress = this.snapshots.length > 1
      ? Math.round((step / (this.snapshots.length - 1)) * 100)
      : 100;

    this.setData({
      currentStep: step,
      progressPercent: progress
    });
  },

  // ==================== 播放控制 ====================

  togglePlay() {
    this.data.isPlaying ? this.pausePlay() : this.startPlay();
  },

  startPlay() {
    if (this.data.currentStep >= this.snapshots.length - 1) {
      this.drawStep(0);
    }
    this.setData({ isPlaying: true });
    const interval = Math.max(50, Math.floor(500 / this.data.speed));
    this.timer = setInterval(() => {
      const next = this.data.currentStep + 1;
      if (next >= this.snapshots.length) {
        this.pausePlay();
        return;
      }
      this.drawStep(next);
    }, interval);
  },

  pausePlay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setData({ isPlaying: false });
  },

  stopPlay() {
    this.pausePlay();
  },

  reset() {
    this.pausePlay();
    this.drawStep(0);
  },

  stepForward() {
    this.pausePlay();
    this.drawStep(Math.min(this.data.currentStep + 1, this.snapshots.length - 1));
  },

  stepBackward() {
    this.pausePlay();
    this.drawStep(Math.max(this.data.currentStep - 1, 0));
  },

  setSpeed() {
    const { speedIndex, speeds } = this.data;
    const nextIdx = (speedIndex + 1) % speeds.length;
    this.setData({ speed: speeds[nextIdx], speedIndex: nextIdx });
    if (this.data.isPlaying) {
      this.pausePlay();
      this.startPlay();
    }
  },

  // ==================== 进度条拖拽 ====================

  onProgressStart(e) {
    this.pausePlay();
    this.isDragging = true;
    this.seekToPosition(e);
  },

  onProgressMove(e) {
    if (!this.isDragging) return;
    this.seekToPosition(e);
  },

  onProgressEnd() {
    this.isDragging = false;
  },

  seekToPosition(e) {
    const touch = e.touches[0];
    wx.createSelectorQuery()
      .select('.progress-bar')
      .boundingClientRect((rect) => {
        if (!rect) return;
        const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const step = Math.round(pct * (this.snapshots.length - 1));
        this.drawStep(step);
      })
      .exec();
  },

  // ==================== 广告回调（开通流量主后自动生效） ====================

  onAdLoad() {
    // 广告加载成功（开通流量主前不会触发）
  },

  onAdError(err) {
    // 广告加载失败（未开通流量主时静默忽略，不发版即可生效）
    console.log('广告未加载（流量主未开通或网络问题）:', err.detail.errMsg);
  }
});
