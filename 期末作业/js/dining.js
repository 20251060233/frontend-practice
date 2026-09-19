// ===== 食堂查询页逻辑：搜索 + 多条件筛选（交互查询模块）+ 添加评价（管理模块） =====
// 数据来源：data/canteens.json（jQuery $.getJSON 本地加载）
// 评价数据：保存在浏览器 localStorage（key: dining_reviews），仅本机演示用

$(function () {
  'use strict';

  var dishes = [];        // 全部菜品
  var canteenMap = {};    // 食堂 id -> 名称
  var SPICY_TEXT = ['不辣', '微辣', '中辣', '特辣'];
  var REVIEW_KEY = 'dining_reviews';

  // ---------- 数据加载（支持 ?data=data/dining.empty.json 空数据自测） ----------
  var dataUrl = getQueryParam('data') || 'data/canteens.json';
  loadJSON(dataUrl, '菜品数据加载失败').then(function (data) {
    hideGlobalError();
    dishes = data.dishes || [];
    (data.canteens || []).forEach(function (c) { canteenMap[c.id] = c.name; });

    // 按食堂填充两个下拉框（筛选项 + 评价表单）
    var options = (data.canteens || []).map(function (c) {
      return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
    $('#fCanteen').append(options);

    var categories = [];
    dishes.forEach(function (d) {
      if (categories.indexOf(d.category) === -1) categories.push(d.category);
    });
    $('#fCategory').append(categories.map(function (c) {
      return '<option value="' + c + '">' + c + '</option>';
    }).join(''));

    $('#rDish').append(dishes.map(function (d) {
      return '<option value="' + d.id + '">'
        + d.name + '（' + (canteenMap[d.canteenId] || '未知食堂') + '）</option>';
    }).join(''));

    // 支持首页搜索框带来的 ?q= 关键词
    var q = getQueryParam('q');
    if (q) $('#fKeyword').val(decodeURIComponent(q));

    render();
  }).catch(function () { /* 错误提示已由 loadJSON 弹出 */ });

  // ---------- 交互查询：搜索 + 筛选 ----------
  function getFilters() {
    return {
      keyword: $.trim($('#fKeyword').val()).toLowerCase(),
      canteen: $('#fCanteen').val(),
      category: $('#fCategory').val(),
      floor: $('#fFloor').val(),
      price: $('#fPrice').val(),
      spicy: $('#fSpicy').val()
    };
  }

  function matchPrice(price, range) {
    if (range === 'lt10') return price < 10;
    if (range === '10-15') return price >= 10 && price <= 15;
    if (range === 'gt15') return price > 15;
    return true;
  }

  function getFiltered() {
    var f = getFilters();
    return dishes.filter(function (d) {
      if (f.keyword &&
          d.name.toLowerCase().indexOf(f.keyword) === -1 &&
          String(d.stall).toLowerCase().indexOf(f.keyword) === -1) return false;
      if (f.canteen !== 'all' && d.canteenId !== f.canteen) return false;
      if (f.category !== 'all' && d.category !== f.category) return false;
      if (f.floor !== 'all' && Number(d.floor) !== Number(f.floor)) return false;
      if (f.price !== 'all' && !matchPrice(d.price, f.price)) return false;
      if (f.spicy !== 'all' && Number(d.spicy) !== Number(f.spicy)) return false;
      return true;
    });
  }

  // ---------- 渲染菜品卡片 ----------
  function starsOf(rating) {
    var full = Math.round(Number(rating) || 0);
    var s = '';
    for (var i = 0; i < 5; i++) s += (i < full ? '★' : '☆');
    return s;
  }

  function render() {
    var list = getFiltered();
    $('#resultCount').text('筛选结果：' + list.length + ' / ' + dishes.length + ' 道');

    if (!dishes.length) {
      $('#dishGrid').html('<div class="col-12"><div class="empty-tip">'
        + '暂无菜品数据（数据文件为空）。请检查 data/canteens.json。</div></div>');
      return;
    }
    if (!list.length) {
      $('#dishGrid').html('<div class="col-12"><div class="empty-tip">'
        + '没有符合条件的菜品，请调整搜索关键词或筛选条件，'
        + '或点击「重置筛选」查看全部菜品。</div></div>');
      return;
    }

    var html = list.map(function (d) {
      return '<div class="col-sm-6 col-lg-4">'
        + '<div class="card dish-card h-100">'
        + '<div class="card-body">'
        + '<div class="d-flex justify-content-between align-items-start">'
        + '<h3 class="h6 mb-1">' + d.name + '</h3>'
        + '<span class="dish-price">' + d.price + '</span>'
        + '</div>'
        + '<p class="text-muted small mb-2">'
        + (canteenMap[d.canteenId] || '未知食堂') + ' · ' + d.floor + '楼 · ' + d.stall + '</p>'
        + '<p class="mb-2 small">'
        + '<span class="badge bg-secondary me-1">' + d.category + '</span>'
        + '<span class="badge badge-spicy-' + d.spicy + '">' + SPICY_TEXT[d.spicy] + '</span>'
        + '</p>'
        + '<p class="mb-0 small">'
        + '<span class="review-stars">' + starsOf(d.rating) + '</span> '
        + '<span class="text-muted">' + d.rating + ' 分 · 月售 ' + d.sales + ' 份</span>'
        + '</p>'
        + '</div></div></div>';
    }).join('');
    $('#dishGrid').html(html);
  }

  // 关键词即时搜索（输入即查）+ 下拉筛选（选中即查）
  $('#fKeyword').on('input', render);
  $('#filterBar').on('change', 'select', render);
  $('#resetBtn').on('click', function () {
    $('#fKeyword').val('');
    $('#filterBar select').val('all');
    render();
  });

  // ---------- 管理模块：添加 / 删除评价 ----------
  function getReviews() {
    try {
      return JSON.parse(localStorage.getItem(REVIEW_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveReviews(list) {
    try {
      localStorage.setItem(REVIEW_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      showGlobalError('评价保存失败', '浏览器 localStorage 不可用（可能处于隐私模式），评价仅本次会话内显示。');
      return false;
    }
  }

  function renderReviews() {
    var list = getReviews();
    if (!list.length) {
      $('#reviewList').html('<div class="empty-tip">还没有评价，快来写下第一条吧。</div>');
      return;
    }
    $('#reviewList').html(list.map(function (r) {
      return '<div class="card review-item mb-2">'
        + '<div class="card-body py-2 px-3">'
        + '<div class="d-flex justify-content-between align-items-center">'
        + '<div>'
        + '<span class="fw-bold me-2">' + r.nickname + '</span>'
        + '<span class="review-stars small">' + starsOf(r.star) + '</span>'
        + '</div>'
        + '<button type="button" class="btn btn-sm btn-outline-danger" data-delete="' + r.id + '">删除</button>'
        + '</div>'
        + '<p class="mb-1 small">' + r.dishName + ' · ' + r.content + '</p>'
        + '<p class="mb-0 text-muted" style="font-size:0.75rem">' + r.time + '</p>'
        + '</div></div>';
    }).join(''));
  }

  // 内联校验：逐项检查并显示错误
  function validateReview() {
    var ok = true;
    function setError(id, msg) {
      $(id).text(msg || '');
      if (msg) ok = false;
    }
    var nickname = $.trim($('#rNickname').val());
    var content = $.trim($('#rContent').val());

    setError('#errDish', $('#rDish').val() ? '' : '请选择要评价的菜品');
    setError('#errNickname', nickname ? (nickname.length > 12 ? '昵称不能超过 12 个字' : '') : '请填写昵称');
    setError('#errStar', $('#rStar').val() ? '' : '请选择评分');
    setError('#errContent', content ? (content.length > 100 ? '内容不能超过 100 字' : '') : '请填写评价内容');

    return ok ? { nickname: nickname, content: content } : null;
  }

  // 提交处理：按钮 click 与表单 submit（回车键）两条路径共用，均先走校验
  function handleReviewSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var v = validateReview();
    if (!v) return;

    var dishId = $('#rDish').val();
    var dish = dishes.filter(function (d) { return d.id === dishId; })[0];
    var list = getReviews();
    list.unshift({
      id: Date.now(),
      dishId: dishId,
      dishName: dish ? dish.name : dishId,
      nickname: v.nickname,
      star: Number($('#rStar').val()),
      content: v.content,
      time: new Date().toLocaleString('zh-CN')
    });
    if (saveReviews(list)) {
      $('#reviewForm')[0].reset();
      $('#reviewOk').text('评价提交成功！').fadeIn();
      setTimeout(function () { $('#reviewOk').fadeOut(); }, 2500);
      renderReviews();
    }
  }
  $('#reviewForm').on('submit', handleReviewSubmit);
  $('#reviewSubmit').on('click', handleReviewSubmit);

  $('#reviewList').on('click', '[data-delete]', function () {
    if (!window.confirm('确定删除这条评价吗？')) return;
    var id = Number($(this).data('delete'));
    saveReviews(getReviews().filter(function (r) { return r.id !== id; }));
    renderReviews();
  });

  renderReviews();
});
