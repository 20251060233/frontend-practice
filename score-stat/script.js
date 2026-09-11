const scores = [
  { name: '李四', score: 92 },
  { name: '王五', score: 45 },
  { name: '赵六', score: 77 },
  { name: '孙七', score: 59 },
  { name: '周八', score: 88 },
  { name: '吴九', score: 105 },   // 非法值，超过满分100
  { name: '郑十', score: -3 }     // 非法负值
];
console.table(scores);