const form = document.querySelector('#add-form');
const input = document.querySelector('#task-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#task-list');
const filters = document.querySelector('.filters');

let currentFilter = 'all'; // all / active / done
// 第三步：localStorage读取，没有数据则为空数组
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// 保存函数
const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

const render = () => {
  list.innerHTML = '';
  // 根据过滤条件筛选要展示的任务
  const shown = tasks.filter(t =>
    currentFilter === 'all' ? true :
    currentFilter === 'active' ? !t.done : t.done
  );

  if (shown.length === 0) {
    const li = document.createElement('li');
    li.textContent = '没有符合条件的任务';
    list.appendChild(li);
    return;
  }

  shown.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.done) li.classList.add('done');
    // 点击任务切换完成状态
    li.addEventListener('click', () => {
      task.done = !task.done;
      save(); // 修改状态后保存本地
      render();
    });
    list.appendChild(li);
  });
};

// 添加任务表单提交
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === '') {
    tip.textContent = '任务名不能为空';
    return;
  }
  tasks.push({ text: text, done: false });
  tip.textContent = '';
  input.value = '';
  save(); //新增任务后保存
  render();
});

// 过滤按钮点击事件
filters.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  currentFilter = e.target.dataset.filter;
  render();
});

// 首次页面加载渲染
render();
