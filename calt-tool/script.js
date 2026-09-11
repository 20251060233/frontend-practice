const courseList = [
  { name: '高等数学', score: 82, credit: 4 },
  { name: '大学英语', score: 68, credit: 2 },
  { name: '计算机导论', score: 91, credit: 3 },
  { name: '思政概论', score: -5, credit:2 },  //非法负分
  { name: '体育', score: 106, credit:1 },    //超100非法
  { name: '通识课', score: '', credit: 1.5 } //空非法数据
];
console.table(courseList);