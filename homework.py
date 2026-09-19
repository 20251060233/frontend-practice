# ===== 1. 鸡兔同笼 =====
def chicken_rabbit():
    print("=== 1. 鸡兔同笼 ===")
    heads = int(input("输入头的个数: "))
    feet = int(input("输入脚的个数: "))
    # 设鸡 c 只，兔 r 只：c + r = heads; 2c + 4r = feet
    # 解得 r = (feet - 2*heads) / 2，c = heads - r
    rabbits = (feet - 2 * heads) / 2
    chickens = heads - rabbits
    if feet % 2 != 0 or rabbits < 0 or chickens < 0 or rabbits != int(rabbits):
        print("无解：输入数据不合理\n")
    else:
        print(f"鸡: {int(chickens)} 只, 兔: {int(rabbits)} 只\n")


# ===== 2. 分数评级 =====
def grade_score():
    print("=== 2. 分数评级 ===")
    score = float(input("输入成绩分数: "))
    if score < 0 or score > 100:
        print("分数需在 0~100 之间\n")
    elif score < 60:
        print("等级: 不及格\n")
    elif score < 70:
        print("等级: 差\n")
    elif score < 80:
        print("等级: 中\n")
    elif score < 90:
        print("等级: 良\n")
    else:
        print("等级: 优\n")


# ===== 3. x + xx + xxx + ... (共 n 项) =====
def sum_xx():
    print("=== 3. x + xx + xxx + ... (共 n 项) ===")
    x = input("输入 x (单个数字): ").strip()
    n = int(input("输入 n (项数): "))
    # 把 x 转成字符串，第 i 项就是 x 重复 i 次再转整数
    total = sum(int(x * i) for i in range(1, n + 1))
    print(f"sum = {total}\n")


if __name__ == "__main__":
    chicken_rabbit()
    grade_score()
    sum_xx()
