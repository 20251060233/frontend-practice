# 第二题：分数评级
# 输入成绩分数，输出等级：不及格 / 差 / 中 / 良 / 优

score = float(input("输入成绩分数: "))

if score < 0 or score > 100:
    print("分数需在 0~100 之间")
elif score < 60:
    print("等级: 不及格")
elif score < 70:
    print("等级: 差")
elif score < 80:
    print("等级: 中")
elif score < 90:
    print("等级: 良")
else:
    print("等级: 优")
