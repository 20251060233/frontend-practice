// ===== 数据统计页逻辑：各食堂就餐人次柱状图 + 菜品类别占比饼图（ECharts） =====
// 数据来源：data/stats.json；支持 ?data=data/stats.empty.json 切换空数据自测

$(function () {
  'use strict';

  var dataUrl = getQueryParam('data') || 'data/stats.json';

  loadJSON(dataUrl, '统计数据加载失败').then(function (data) {
    var byCanteen = data.byCanteen || [];
    var byCategory = data.byCategory || [];

    if (!byCanteen.length && !byCategory.length) {
      $('#statsEmpty').show();
      $('#barChart, #pieChart').hide();
      $('#statsMeta').text('当前数据文件为空：' + dataUrl);
      return;
    }

    if (typeof echarts === 'undefined') {
      showGlobalError('图表库加载失败', 'ECharts 不可用，无法绘制图表。'
        + '\n请确认 libs/echarts.min.js 文件存在后刷新页面。');
      return;
    }

    hideGlobalError();
    $('#statsMeta').text((data.week || '') + ' · 数据来源：' + (data.source || '—'));

    // ----- 柱状图：各食堂一周就餐人次 -----
    var bar = echarts.init(document.getElementById('barChart'));
    bar.setOption({
      title: {
        text: '各食堂一周就餐人次',
        subtext: data.source || '示例数据',
        left: 'center',
        textStyle: { fontSize: 15 }
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 70, right: 24, top: 80, bottom: 36 },
      xAxis: {
        type: 'category',
        data: byCanteen.map(function (d) { return d.name; }),
        axisLabel: { interval: 0 }
      },
      yAxis: { type: 'value', name: '人次' },
      series: [{
        name: '就餐人次',
        type: 'bar',
        barWidth: '45%',
        data: byCanteen.map(function (d) { return d.value; }),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff8f00' },
            { offset: 1, color: '#e65100' }
          ]),
          borderRadius: [6, 6, 0, 0]
        },
        label: { show: true, position: 'top', formatter: '{c}' }
      }]
    });

    // ----- 饼图：菜品类别供应占比 -----
    var pie = echarts.init(document.getElementById('pieChart'));
    pie.setOption({
      title: {
        text: '菜品类别供应占比',
        subtext: '按在售菜品数量统计',
        left: 'center',
        textStyle: { fontSize: 15 }
      },
      tooltip: { trigger: 'item', formatter: '{b}：{c} 道（{d}%）' },
      legend: { orient: 'horizontal', bottom: 6 },
      series: [{
        name: '菜品类别',
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        label: { formatter: '{b} {d}%' },
        data: byCategory.map(function (d) { return { name: d.name, value: d.value }; })
      }]
    });

    window.addEventListener('resize', function () {
      bar.resize();
      pie.resize();
    });
  }).catch(function () { /* 错误提示已由 loadJSON 弹出 */ });
});
