
const courseList = [
  { name: '高等数学', score: 82, credit: 4 },
  { name: '大学英语', score: 68, credit: 2 },
  { name: '计算机导论', score: 91, credit: 3 },
  { name: '思政概论', score: -5, credit: 2 },
  { name: '体育', score: 106, credit: 1 },
  { name: '通识课', score: '', credit: 1.5 }
];
console.table(courseList);

// 清洗函数：过滤合法课程数据
const validCourse = (list) => {
  return list.filter(item => {
    const s = Number(item.score);
    const c = Number(item.credit);
    return s >= 0 && s <= 100 && c > 0;
  });
};

// 分数转换绩点
const scoreToGpa = (score) => {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 82) return 3.3;
  if (score >= 78) return 3.0;
  if (score >= 75) return 2.7;
  if (score >= 72) return 2.3;
  if (score >= 68) return 2.0;
  if (score >= 64) return 1.5;
  if (score >= 60) return 1.0;
  return 0;
};

// 加权绩点计算
const calcGpa = (courseArr) => {
  if (courseArr.length === 0) return 0;
  let totalCredit = 0;
  let totalGpaScore = 0;
  courseArr.forEach(item => {
    const g = scoreToGpa(item.score);
    totalGpaScore += g * item.credit;
    totalCredit += item.credit;
  });
  return (totalGpaScore / totalCredit).toFixed(2);
};

// 获取不及格课程
const getFailedCourse = (list) => list.filter(i => i.score < 60).map(i => i.name);

// 中间结果打印
const validData = validCourse(courseList);
console.log("清洗后合法课程：", validData);
console.log("加权总绩点：", calcGpa(validData));
console.log("不及格课程：", getFailedCourse(validData));

// 生成最终报告
const generateReport = (courseArr) => {
  const valid = validCourse(courseArr);
  if (valid.length === 0) {
    return "无有效课程数据";
  }
  const gpaResult = calcGpa(valid);
  const failList = getFailedCourse(valid);
  return `统计报告：有效课程${valid.length}门，加权总绩点${gpaResult}；不及格课程：${failList.join('、') || '无'}`;
};

try {
  console.log("=====最终绩点报告=====");
  console.log(generateReport(courseList));
  // 空数据测试
  console.log("=====空数据测试=====");
  console.log(generateReport([]));
} catch (err) {
  console.error("计算失败：", err.message);
}
