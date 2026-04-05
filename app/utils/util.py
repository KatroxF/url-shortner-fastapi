import string
BASE62=string.ascii_letters + string.digits

def encode(num:int):
    base=len(BASE62)
    result=[]
    while num>0:
        result.append(BASE62[num%base])
        num//=base
    return ".join(reversed(result))"   