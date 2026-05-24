const { getAlgorithmById } = require('../../data/algorithmMeta');
const { executeAlgorithm, generateRandomArray } = require('../../utils/algorithms');
const { Visualizer } = require('../../utils/visualizer');

Page({
  data: {
    algorithm: {},
    showLock: false,
    lockTitle: '',
    lockDesc: '',
    lockBtnText: '观看广告解锁',
    lockExtra: '',
    freeRemaining: 3,
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
  rewardedVideoAd: null,

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

    // 进阶算法：每日免费 3 次，超出看广告
    if (algorithm.difficulty === '进阶') {
      const status = this.checkDailyQuota();
      if (!status.allowed) {
        this.setData({
          showLock: true,
          lockTitle: '今日次数已用完',
          lockDesc: '每日免费学 3 个进阶算法\n观看小广告可继续学习 🎁',
          lockBtnText: '看广告继续学习',
          lockExtra: '明天 0 点自动重置免费次数',
          freeRemaining: 0
        });
        this.createRewardedVideoAd();
        return;
      }
      this.setData({ freeRemaining: Math.max(0, 3 - status.quota.free) });
    }
  },

  onReady() {
    if (!this.data.showLock) {
      this.initCanvas();
    }
  },

  onUnload() {
    this.stopPlay();
    if (this.rewardedVideoAd) {
      this.rewardedVideoAd.destroy();
    }
  },

  // ==================== 每日配额 + 解锁逻辑 ====================

  checkDailyQuota() {
    const today = new Date().toDateString();
    const quota = wx.getStorageSync('algo_daily_quota') || { date: '', free: 0, ad: 0 };

    // 新的一天，重置
    if (quota.date !== today) {
      quota.date = today;
      quota.free = 0;
      quota.ad = 0;
    }

    if (quota.free < 3) {
      quota.free++;
      wx.setStorageSync('algo_daily_quota', quota);
      return { allowed: true, quota };
    }

    return { allowed: false, quota };
  },

  createRewardedVideoAd() {
    // 测试广告位 ID：调试时可正常展示测试广告，上线后替换为真实 ID
    const adUnitId = 'adunit-927b5e04bd215e40';

    // 尝试创建激励视频广告（开发工具中可能不支持，但真机上可用）
    try {
      this.rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId });

      this.rewardedVideoAd.onLoad(() => {
        console.log('激励视频广告加载成功');
      });

      this.rewardedVideoAd.onError((err) => {
        console.log('激励视频广告加载失败:', err);
        // 广告加载失败时，开发模式下直接解锁
        wx.showModal({
          title: '提示',
          content: '广告暂未准备好（开发/调试模式下正常现象），是否直接解锁？',
          success: (res) => {
            if (res.confirm) {
              this.doUnlock();
            }
          }
        });
      });

      this.rewardedVideoAd.onClose((res) => {
        if (res && res.isEnded) {
          // 用户完整观看了广告 → 解锁
          this.doUnlock();
        } else {
          wx.showToast({ title: '需看完广告才能解锁哦', icon: 'none' });
        }
      });
    } catch (e) {
      // 开发工具中 createRewardedVideoAd 可能不可用，降级处理
      console.log('当前环境不支持激励视频，开发模式下直接解锁');
      wx.showModal({
        title: '开发模式',
        content: '当前环境暂不支持广告，直接解锁此算法。',
        showCancel: false,
        success: () => {
          this.doUnlock();
        }
      });
    }
  },

  unlockByAd() {
    if (this.rewardedVideoAd) {
      this.rewardedVideoAd.show().catch((err) => {
        console.log('广告展示失败:', err);
        // 展示失败时尝试重新加载
        this.rewardedVideoAd.load().then(() => {
          return this.rewardedVideoAd.show();
        }).catch(() => {
          wx.showModal({
            title: '提示',
            content: '广告暂时无法播放，是否直接解锁？',
            success: (res) => {
              if (res.confirm) {
                this.doUnlock();
              }
            }
          });
        });
      });
    } else {
      this.doUnlock();
    }
  },

  doUnlock() {
    // 广告观看完毕，增加 1 次额外学习机会
    const today = new Date().toDateString();
    const quota = wx.getStorageSync('algo_daily_quota') || { date: today, free: 0, ad: 0 };
    quota.ad++;
    quota.free++; // 用广告换 1 次
    wx.setStorageSync('algo_daily_quota', quota);

    this.setData({ showLock: false });
    wx.showToast({ title: '解锁成功！', icon: 'success', duration: 1200 });

    // 初始化 canvas 并运行算法
    this.initCanvas();
  },

  goBack() {
    wx.navigateBack();
  },

  preventTap() {
    // 阻止点击穿透遮罩层
  },

  // ==================== Canvas 初始化 ====================

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#vizCanvas').boundingClientRect();
    query.select('#vizCanvas').fields({ node: true });
    query.exec((res) => {
      const rect = res[0];
      const node = res[1];
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

  // ==================== 广告回调 ====================

  onAdLoad() {
    console.log('✅ Banner广告加载成功');
  },

  onAdError(err) {
    const msg = err.detail.errMsg || '未知错误';
    console.warn('❌ Banner广告加载失败:', msg);
    // 常见原因：
    // 1. 真机预览不支持测试广告 → 需要上传"体验版"测试
    // 2. 正式版需用真实广告位 ID 替换测试 ID
  }
});
