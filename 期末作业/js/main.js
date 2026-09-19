// ===== 首页逻辑：数据概览卡片 + 一周就餐趋势折线图（ECharts） =====
// 三维场景由 three-d/scene.js 自行初始化（含 WebGL 降级）

$(function () {
  'use strict';

  // ----- 1. 数据概览卡片：加载 canteens.json -----
  loadJSON('data/canteens.json', '食堂基础数据加载失败').then(function (data) {
    hideGlobalError();
    var dishes = data.dishes || [];
    var canteens = data.canteens || [];
    var seats = canteens.reduce(function (sum, c) { return sum + (c.seats || 0); }, 0);

    $('#statCanteen').text(formatNumber(canteens.length));
    $('#statDish').text(formatNumber(dishes.length));
    $('#statSeat').text(formatNumber(seats));
    $('#dataSource').text(data.source || '—');
    $('#updateTime').text(data.updateTime || '—');

    // 搜索框快捷跳转：把关键词带到查询页
    $('#quickSearchBtn').on('click', function () {
      var kw = $.trim($('#quickSearch').val());
      window.location.href = 'dining.html' + (kw ? '?q=' + encodeURIComponent(kw) : '');
    });
    $('#quickSearch').on('keydown', function (e) {
      if (e.key === 'Enter') $('#quickSearchBtn').trigger('click');
    });
  }).catch(function () { /* 错误提示已由 loadJSON 弹出 */ });

  // ----- 2. 一周就餐趋势折线图：加载 stats.json -----
  loadJSON('data/stats.json', '统计数据加载失败').then(function (data) {
    var daily = data.daily || [];

    if (!daily.length) {
      $('#trendChart').hide();
      $('#trendEmpty').show();
      return;
    }

    if (typeof echarts === 'undefined') {
      showGlobalError('图表库加载失败', 'ECharts 不可用，无法绘制折线图。'
        + '\n请确认 libs/echarts.min.js 文件存在后刷新页面。');
      return;
    }

    var chart = echarts.init(document.getElementById('trendChart'));
    chart.setOption({
      title: {
        text: '一周三餐就餐人次趋势',
        subtext: (data.week || '') + ' · ' + (data.source || '示例数据'),
        left: 'center',
        textStyle: { fontSize: 15 }
      },
      tooltip: { trigger: 'axis' },
      legend: { data: ['早餐', '午餐', '晚餐'], top: 52 },
      grid: { left: 56, right: 24, top: 96, bottom: 36 },
      xAxis: {
        type: 'category',
        data: daily.map(function (d) { return d.day; })
      },
      yAxis: { type: 'value', name: '人次' },
      series: [
        {
          name: '早餐', type: 'line', smooth: true,
          data: daily.map(function (d) { return d.breakfast; }),
          itemStyle: { color: '#fb8c00' }
        },
        {
          name: '午餐', type: 'line', smooth: true,
          data: daily.map(function (d) { return d.lunch; }),
          itemStyle: { color: '#e65100' }
        },
        {
          name: '晚餐', type: 'line', smooth: true,
          data: daily.map(function (d) { return d.dinner; }),
          itemStyle: { color: '#6d4c41' }
        }
      ]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }).catch(function () { /* 错误提示已由 loadJSON 弹出 */ });
});
