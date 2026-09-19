// ===== 公共脚本：全局错误提示 + JSON 数据加载（不依赖 jQuery，库失败也能提示） =====

/** 在页面顶部显示一条全局错误提示条，可随时重复调用覆盖内容 */
function showGlobalError(title, detail) {
  var box = document.getElementById('globalError');
  if (!box) {
    box = document.createElement('div');
    box.id = 'globalError';
    box.className = 'alert alert-danger global-error';
    var main = document.querySelector('main') || document.body;
    main.parentNode.insertBefore(box, main);
  }
  var html = '<strong>' + title + '</strong>';
  if (detail) {
    html += '<pre>' + String(detail).replace(/</g, '&lt;') + '</pre>';
  }
  box.innerHTML = html;
  box.style.display = 'block';
}

/** 隐藏全局错误提示条 */
function hideGlobalError() {
  var box = document.getElementById('globalError');
  if (box) box.style.display = 'none';
}

/**
 * 读取 URL 查询参数（用于空数据自测：?data=data/stats.empty.json）
 */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * 基于 jQuery $.getJSON 加载本地 JSON。
 * 加载失败时自动弹出含原因与解决方法的全局提示条，并 reject({message, error})。
 */
function loadJSON(url, failedTitle) {
  return new Promise(function (resolve, reject) {
    if (typeof jQuery === 'undefined' || !jQuery.ajax) {
      var msg = '页面基础库 jQuery 加载失败，数据功能不可用。\n'
        + '请确认 libs/jquery-3.7.1.min.js 文件存在后刷新页面。';
      showGlobalError('库加载失败', msg);
      reject({ message: msg });
      return;
    }
    jQuery.ajax({
      url: url,
      dataType: 'json',
      cache: false
    }).done(function (data) {
      resolve(data);
    }).fail(function (jqXHR, textStatus, err) {
      var detail;
      if (window.location.protocol === 'file:') {
        detail = '原因：当前是通过 file:// 直接双击打开页面，浏览器安全策略会拦截本地 JSON 读取。\n'
          + '解决方法：在本文件夹打开命令行，运行本地静态服务器：\n'
          + '    python -m http.server 8787\n'
          + '然后访问 http://localhost:8787/index.html';
      } else if (jqXHR.status === 404) {
        detail = '原因：数据文件未找到（404），请检查路径是否正确：' + url + '\n'
          + '解决方法：确认 data/ 目录下的 JSON 文件完整。';
      } else {
        detail = '原因：' + (err || textStatus) + '（状态码：' + jqXHR.status + '）\n'
          + '解决方法：请确认本地服务器正在运行后刷新页面。';
      }
      showGlobalError(failedTitle || '数据加载失败', detail);
      reject({ message: detail, error: err, status: jqXHR.status });
    });
  });
}

/** 数字加千分位 */
function formatNumber(n) {
  return Number(n).toLocaleString('zh-CN');
}
