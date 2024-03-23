def encrypt(input: str, n: int, d: int):
    result = ''
    for char in input[::-1]:
        val = ord(char)
        change = (d * n)
        for _ in range(0, change, d):
            val += d
            if val < 34:
                val = 126
            elif val > 126:
                val = 35
        result += chr(val)
    return result

def decrypt(input: str, n: int, d: int):
    result = ''
    for char in reversed(input):
        val = ord(char)
        change = (-1 * d * n)
        for _ in range(0, change, -1 * d):
            val += (-1 * d)
            if val < 34:
                val = 126
            elif val > 126:
                val = 35
        result += chr(val)
    return result


# class hardwareSet:
#     def __init__(self):
#         self.capacity = 0
#         self.availability = 0
        
#     def initialize_capacity(self, qty):
#         self.capacity = qty
#         self.availability = qty

#     def get_capacity(self):
#         return self.capacity

#     def get_availability(self):
#         return self.availability

#     def check_out(self, qty):
#         if self.availability >= qty:
#             self.availability -= qty
#         else:
#             self.availability = 0
#             return -1
#         return 0

#     def check_in(self, qty):
#         if self.capacity - self.availability < qty:
#             return -1
#         else:
#             self.availability += qty
#         return 0
