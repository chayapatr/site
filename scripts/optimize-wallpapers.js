import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join } from 'path'

const srcDir = 'static/usr/share/wallpaper'
const files = (await readdir(srcDir)).filter(f => /\.(png|jpg|jpeg)$/i.test(f))

for (const file of files) {
  const src = join(srcDir, file)
  const dest = join(srcDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
  await sharp(src)
    .resize(1920, 1080, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest)
  console.log(`optimized ${file} → ${dest.split('/').pop()}`)
}
