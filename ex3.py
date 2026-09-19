# 第三题：输入 x 与 n，输出 sum = x + xx + xxx + xxxx + ... + xxxxxxx (共 n 项)

x = input("输入 x (单个数字): ").strip()
n = int(input("输入 n (项数): "))

# 第 i 项就是 x 重复 i 次（用字符串乘法），再转整数求和
total = sum(int(x * i) for i in range(1, n + 1))

print(f"sum = {total}")
