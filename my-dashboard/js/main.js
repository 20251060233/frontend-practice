$(function(){
  const $statusBox = $('#statusBox');
  let rawData = [];
  let myEchart = null;
  let myChartJS = null;

  // ====== fetch加载本地JSON ======
  async function loadData(){
    // 加载中状态
    $statusBox.attr('class','loading').text('数据加载中，请稍候...');
    try{
      const res = await fetch('./data/campus.json');
      if(!res.ok) throw new Error('请求失败');
      const json = await res.json();
      rawData = json.dataList;
      // 空数据判断
      if(rawData.length === 0){
        $statusBox.attr('class','empty').text('暂无数据');
        return;
      }
      $statusBox.text(`数据加载完成，数据来源：${json.source}`);
      renderChart(rawData);
    }catch(err){
      // 失败状态（断网/路径错误触发）
      $statusBox.attr('class','error').text('数据加载失败，请检查文件或网络');
      console.error(err);
    }
  }

  // ====== 渲染图表：ECharts柱状图 + Chart.js饼图 ======
  function renderChart(data){
    // ECharts：学生月消费柱状图
    if(!myEchart) myEchart = echarts.init(document.getElementById('chartE'));
    const eOption = {
      title:{text:"学生月度消费对比",subtext:"单位：元｜数据来源：校园学生抽样统计"},
      xAxis:{type:'category',data:data.map(item=>item.name)},
      yAxis:{type:'value'},
      series:[{type:'bar',data:data.map(item=>item.consume)}]
    };
    myEchart.setOption(eOption);

    // Chart.js：自习时长饼图
    const ctx = document.getElementById('chartC').getContext('2d');
    if(myChartJS) myChartJS.destroy();
    myChartJS = new Chart(ctx,{
      type:'pie',
      data:{
        labels:data.map(item=>item.name),
        datasets:[{data:data.map(item=>item.studyHour),backgroundColor:['#5470C6','#91CC75','#FAC858','#EE6666']}]
      },
      options:{
        plugins:{title:{display:true,text:"学生月度自习时长占比，单位：小时｜数据来源：校园学生抽样统计"}}
      }
    })
  }

  // ===== jQuery交互：消费金额筛选按钮 =====
  $('#filterBtn').on('click',function(){
    const minVal = Number($('#consumeFilter').val());
    const filterData = rawData.filter(item=> item.consume >= minVal);
    if(filterData.length ===0){
      $statusBox.attr('class','empty').text('筛选后暂无数据');
      return;
    }
    $statusBox.text(`筛选完成，最低消费${minVal}元`);
    renderChart(filterData);
  })

  // 页面启动加载
  loadData();
})
