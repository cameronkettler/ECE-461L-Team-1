from backend.app import encrypt, decrypt

def test_encrypt_decrypt():
    all = "\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
    for i in range(-130,130):
        assert decrypt(encrypt(all, i, 1), i, 1) == all
        assert decrypt(encrypt(all, i, -1), i, -1) == all

