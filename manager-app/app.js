const addForm = document.querySelector('#add-form');
const bookNameInput = document.querySelector('#bookName');
const authorInput = document.querySelector('#author');
const scoreInput = document.querySelector('#score');
const tip = document.querySelector('#tip');
const listWrap = document.querySelector('#book-list');

// 读取本地存储，无数据则为空数组
let bookList = JSON.parse(localStorage.getItem('books') || '[]');

// 保存函数
function saveData() {
  localStorage.setItem('books', JSON.stringify(bookList));
}

// 渲染函数：先操作数组，再render；全部用textContent，禁止innerHTML拼接用户内容
function render() {
  listWrap.innerHTML = '';
  if (bookList.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.textContent = '暂无收藏图书';
    listWrap.appendChild(emptyDiv);
    return;
  }

  bookList.forEach((book, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'book-item';

    const nameP = document.createElement('p');
    nameP.textContent = `书名：${book.bookName}`;
    const authorP = document.createElement('p');
    authorP.textContent = `作者：${book.author}`;
    const scoreP = document.createElement('p');
    scoreP.textContent = `评分：${book.score}`;

    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.dataset.index = index;
    delBtn.addEventListener('click', () => {
      // 修改数组
      bookList.splice(index, 1);
      saveData();
      render();
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = '修改';
    editBtn.dataset.index = index;
    editBtn.addEventListener('click', () => {
      const newName = prompt("输入新书名", book.bookName);
      const newAuthor = prompt("输入新作者", book.author);
      const newScoreStr = prompt("输入新评分(0-10)", book.score);
      const newScore = Number(newScoreStr);

      // 修改时同样校验
      if (!newName || newName.trim() === "") {
        tip.textContent = "书名不能为空！";
        return;
      }
      if (isNaN(newScore) || newScore < 0 || newScore > 10) {
        tip.textContent = "评分必须是0~10之间数字";
        return;
      }
      tip.textContent = "";
      bookList[index].bookName = newName.trim();
      bookList[index].author = newAuthor.trim();
      bookList[index].score = newScore;
      saveData();
      render();
    });

    itemDiv.appendChild(nameP);
    itemDiv.appendChild(authorP);
    itemDiv.appendChild(scoreP);
    itemDiv.appendChild(editBtn);
    itemDiv.appendChild(delBtn);
    listWrap.appendChild(itemDiv);
  })
}

// 添加表单提交
addForm.addEventListener('submit', function (e) {
  e.preventDefault();
  tip.textContent = '';
  const bookName = bookNameInput.value.trim();
  const author = authorInput.value.trim();
  const scoreVal = Number(scoreInput.value);

  // 输入校验
  if (bookName === "") {
    tip.textContent = "书名不能为空！";
    return;
  }
  if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
    tip.textContent = "评分必须是0~10之间数字";
    return;
  }

  // 修改数组
  bookList.push({
    bookName: bookName,
    author: author,
    score: scoreVal
  });
  saveData();
  // 清空输入框
  bookNameInput.value = "";
  authorInput.value = "";
  scoreInput.value = "";
  render();
});

// 页面首次加载渲染
render();
