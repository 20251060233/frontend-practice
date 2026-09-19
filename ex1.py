# 第一题：鸡兔同笼
# 输入头的个数和脚的个数，计算有多少只兔子多少只鸡

heads = int(input("输入头的个数: "))
feet = int(input("输入脚的个数: "))

# 设鸡 c 只，兔 r 只
# c + r = heads
# 2c + 4r = feet
# 解得 r = (feet - 2*heads) / 2，c = heads - r
rabbits = (feet - 2 * heads) / 2
chickens = heads - rabbits

if feet % 2 != 0 or rabbits < 0 or chickens < 0 or rabbits != int(rabbits):
    print("无解：输入数据不合理")
else:
    print(f"鸡: {int(chickens)} 只, 兔: {int(rabbits)} 只")
