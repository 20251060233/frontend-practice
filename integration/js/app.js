/* ===== 校园信息中心 · 首页交互 =====
 * 模块一：自习室列表按楼层 / 开放状态即时筛选（数据写死在 JS 数组）
 * 模块二：fetch 加载 data.json，ECharts 渲染各自习室使用量柱状图
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // 模块一：自习室查询（复用课堂五的“数组 + filter”筛选模式）
  // ---------------------------------------------------------------
  const rooms = [
    { name: '第一自习室', floor: 1, seats: 80,  used: 65, open: true  },
    { name: '第二自习室', floor: 1, seats: 60,  used: 0,  open: false },
    { name: '第三自习室', floor: 2, seats: 100, used: 92, open: true  },
    { name: '第四自习室', floor: 2, seats: 72,  used: 41, open: true  },
    { name: '第五自习室', floor: 3, seats: 56,  used: 0,  open: false },
    { name: '第六自习室', floor: 3, seats: 90,  used: 78, open: true  },
    { name: '考研自习室', floor: 4, seats: 48,  used: 46, open: true  },
    { name: '电子阅览室', floor: 4, seats: 40,  used: 23, open: true  }
  ];

  const roomListEl = document.getElementById('roomList');
  const roomCountEl = document.getElementById('roomCount');
  const floorFilterEl = document.getElementById('floorFilter');
  const statusFilterEl = document.getElementById('statusFilter');

  // 单条自习室卡片
  function roomCardHTML(room) {
    const rate = Math.round((room.used / room.seats) * 100);
    const badge = room.open
      ? '<span class="badge bg-success">开放中</span>'
      : '<span class="badge bg-secondary">维护关闭</span>';
    const occupancy = room.open
      ? '<div class="occupancy-bar' + (rate >= 85 ? ' is-high' : '') + '">'
        + '<span style="width:' + rate + '%"></span></div>'
        + '<small class="text-muted">入座率 ' + rate + '%（' + room.used + '/' + room.seats + ' 座）</small>'
      : '<small class="text-muted">设备维护中，暂不开放</small>';

    return '<div class="col-md-6 col-xl-4">'
      + '<div class="card room-card' + (room.open ? '' : ' is-closed') + ' shadow-sm">'
      +   '<div class="card-body">'
      +     '<div class="d-flex justify-content-between align-items-center mb-2">'
      +       '<h3 class="h6 mb-0">' + room.name + '</h3>' + badge
      +     '</div>'
      +     '<ul class="room-meta"><li>位置：第 ' + room.floor + ' 层</li><li>座位：' + room.seats + ' 个</li></ul>'
      +     occupancy
      +   '</div>'
      + '</div></div>';
  }

  // 根据两个筛选条件即时渲染
  function renderRooms() {
    const floor = floorFilterEl.value;
    const status = statusFilterEl.value;

    const result = rooms.filter(function (room) {
      const floorOk = (floor === 'all' || room.floor === Number(floor));
      const statusOk = (status === 'all'
        || (status === 'open' && room.open)
        || (status === 'closed' && !room.open));
      return floorOk && statusOk;
    });

    roomCountEl.textContent = '共找到 ' + result.length + ' 间自习室';
    if (result.length === 0) {
      roomListEl.innerHTML = '<div class="empty-tip w-100">没有符合条件的自习室，请调整筛选条件</div>';
      return;
    }
    roomListEl.innerHTML = result.map(roomCardHTML).join('');
  }

  // change 事件：选择后立即生效，无需点击按钮
  floorFilterEl.addEventListener('change', renderRooms);
  statusFilterEl.addEventListener('change', renderRooms);

  // 重置：两个下拉恢复“全部”并重新渲染（同伴审查意见①）
  document.getElementById('resetFilter').addEventListener('click', function () {
    floorFilterEl.value = 'all';
    statusFilterEl.value = 'all';
    renderRooms();
  });

  renderRooms();

  // ---------------------------------------------------------------
  // 模块二：使用量柱状图（复用课堂六 fetch + ECharts 模式）
  // ---------------------------------------------------------------
  const statusEl = document.getElementById('dataStatus');

  function setStatus(type, text) {
    statusEl.className = 'show ' + type;
    statusEl.textContent = text;
  }

  let usageChart = null;

  function renderChart(data) {
    const names = data.records.map(function (r) { return r.name; });
    const values = data.records.map(function (r) { return r.usage; });

    if (usageChart === null) {
      usageChart = echarts.init(document.getElementById('usageChart'));
    }
    usageChart.setOption({
      title: {
        text: data.month + ' 各自习室使用量',
        subtext: '单位：' + data.unit + ' ｜ 数据来源：' + data.source,
        left: 'center'
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 70, right: 30, top: 80, bottom: 50 },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { interval: 0 }
      },
      yAxis: { type: 'value', name: data.unit },
      series: [{
        name: '使用量',
        type: 'bar',
        data: values,
        barMaxWidth: 42,
        itemStyle: { color: '#1565c0', borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top' }
      }]
    });
  }

  async function loadData() {
    // 默认加载 data/data.json；自测空数据时可用 ?data=data/data.empty.json 指定
    var dataFile = new URLSearchParams(location.search).get('data') || 'data/data.json';
    setStatus('loading', '数据加载中，请稍候…');
    try {
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      const data = await response.json();
      if (!data.records || data.records.length === 0) {
        // 空数据：区别于断网报错，用中性提示并清空旧图（同伴审查意见②）
        setStatus('empty', '本月暂无自习室使用量数据，图表将在数据更新后自动渲染');
        if (usageChart) usageChart.clear();
        return;
      }
      setStatus('success', '数据加载完成 ｜ ' + data.month + ' ｜ 数据来源：' + data.source);
      renderChart(data);
    } catch (err) {
      // 断网 / 文件路径错误时给出明确提示，而不是白屏
      setStatus('error', '数据加载失败：请检查网络连接或数据文件路径（当前可能处于断网状态）');
      console.error('统计数据加载失败：', err);
    }
  }

  // ECharts 随窗口宽度重绘（响应式三档宽度自查需要）
  window.addEventListener('resize', function () {
    if (usageChart) usageChart.resize();
  });

  loadData();
})();
