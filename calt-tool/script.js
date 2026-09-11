2704933700: 09-11 18:57:55
// 第1次提交：原始课程成绩数据
const courseList = [
  { name: '高等数学', score: 82, credit: 4 },
  { name: '大学英语', score: 68, credit: 2 },
  { name: '计算机导论', score: 91, credit: 3 },
  { name: '思政概论', score: -5, credit:2 },  //非法负分
  { name: '体育', score: 106, credit:1 },    //超100非法
  { name: '通识课', score: '', credit: 1.5 } //空非法数据
];
console.table(courseList);

// 清洗函数：过滤合法成绩 0<=score<=100，学分大于0
const validCourse = (list) => {
  return list.filter(item => {
    const s = Number(item.score);
    const c = Number(item.credit);
    return s >= 0 && s <= 100 && c > 0;
  })
};

//分数转绩点函数
const scoreToGpa = (score) => {
  if(score >=90) return 4.0;
  if(score >=85) return 3.7;
  if(score >=82) return 3.3;
  if(score >=78) return 3.0;
  if(score >=75) return 2.7;
  if(score >=72) return 2.3;
  if(score >=68) return 2.0;
  if(score >=64) return 1.5;
  if(score >=60) return 1.0;
  return 0;
};

//加权平均绩点计算
const calcGpa = (courseArr) => {
  if(courseArr.length === 0) return 0;
  let totalCredit = 0;
  let totalGpaScore = 0;
  courseArr.forEach(item=>{
    const g = scoreToGpa(item.score);
    totalGpaScore += g * item.credit;
    totalCredit += item.credit;
  })
  return (totalGpaScore / totalCredit).toFixed(2);
};

//获取不及格课程名单
const getFailedCourse = (list) => list.filter(i=>i.score<60).map(i=>i.name);

//中间结果打印
const validData = validCourse(courseList);
console.log("清洗后合法课程：",validData);
console.log("总绩点：",calcGpa(validData));
console.log("不及格课程：",getFailedCourse(validData));


2704933700: 09-11 18:58:01
git add .
git commit -m "添加数据清洗与绩点计算函数"
git push
