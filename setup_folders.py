import os
import shutil

src_dir = 'temp-astro'
dst_dir = '.'

for item in os.listdir(src_dir):
    s = os.path.join(src_dir, item)
    d = os.path.join(dst_dir, item)
    if os.path.exists(d):
        if os.path.isdir(s) and os.path.isdir(d):
            for sub_item in os.listdir(s):
                shutil.move(os.path.join(s, sub_item), os.path.join(d, sub_item))
            os.rmdir(s)
        else:
            os.remove(d)
            shutil.move(s, d)
    else:
        shutil.move(s, d)

os.rmdir(src_dir)

# Now move the existing content and assets to src/
os.makedirs('src/content', exist_ok=True)
os.makedirs('src/assets', exist_ok=True)

if os.path.exists('content'):
    for item in os.listdir('content'):
        shutil.move(os.path.join('content', item), os.path.join('src/content', item))
    os.rmdir('content')

if os.path.exists('assets'):
    for item in os.listdir('assets'):
        shutil.move(os.path.join('assets', item), os.path.join('src/assets', item))
    os.rmdir('assets')

print("Files moved successfully.")
