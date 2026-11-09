import sys, glob
from PIL import Image
ids = sys.argv[2:]
ims = [Image.open(f"out/stills/{i}.jpg") for i in ids]
w, h = ims[0].size
cols = 2
rows = (len(ims)+cols-1)//cols
sheet = Image.new("RGB", (w*cols, h*rows))
for k, im in enumerate(ims):
    sheet.paste(im, ((k%cols)*w, (k//cols)*h))
sheet.save(sys.argv[1], quality=85)
print(sheet.size)
