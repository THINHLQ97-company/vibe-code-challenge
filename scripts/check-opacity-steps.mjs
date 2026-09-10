/**
 * Chặn một lỗi ĐÃ CẮN HAI LẦN: class kiểu `bg-orange/28` với bậc opacity KHÔNG có trong thang thì
 * Tailwind bỏ qua LẶNG LẼ — không cảnh báo, không sinh CSS, build vẫn xanh. Lần đầu mất 89 class
 * (modal mất nền mờ, toàn bộ focus ring biến mất); lần hai mất một vạch ngăn ở dải giải thưởng.
 *
 * Đọc thang thật từ `tailwind.config.ts` rồi quét mã nguồn, báo mọi bậc lạ kèm file:dòng.
 * Chạy: `pnpm check:opacity` — đã gắn vào `pnpm build`.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const config = readFileSync("tailwind.config.ts", "utf8");

/**
 * Thang mặc định của Tailwind v3 là MỖI BẬC 5 từ 0 tới 100 — không phải một danh sách rời rạc.
 * (Gõ tay danh sách rời rạc là cách nhanh nhất để phép kiểm báo động giả hàng loạt: bản nháp đầu
 * của script này báo nhầm 35 class hợp lệ.)
 */
const STEPS = new Set(Array.from({ length: 21 }, (_, i) => i * 5));
const extra = config.match(/opacity:\s*\{([^}]*)\}/s);
if (extra) for (const m of extra[1].matchAll(/(\d+)\s*:/g)) STEPS.add(Number(m[1]));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      // Mã vendor DSVH đồng bộ từ upstream — không sửa ở repo này nên không gác.
      if (p.includes("/dsvh")) continue;
      walk(p, out);
    } else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const PREFIX =
  "bg|text|border|ring|divide|from|via|to|outline|placeholder|decoration|shadow|fill|stroke|accent|caret";
const RE = new RegExp(`\\b(?:${PREFIX})-[a-z0-9-]+\\/(\\d{1,3})\\b`, "g");

const files = ["app", "components", "lib"].flatMap((d) => walk(d));
const bad = [];
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const m of line.matchAll(RE)) {
        if (!STEPS.has(Number(m[1]))) bad.push({ file, line: i + 1, cls: m[0] });
      }
    });
}

if (bad.length === 0) {
  console.log(`✓ opacity: quét ${files.length} file, mọi bậc đều có trong thang`);
  process.exit(0);
}
console.error(`✗ ${bad.length} class dùng bậc opacity KHÔNG có trong thang — Tailwind sẽ bỏ qua:\n`);
for (const b of bad) console.error(`  ${b.file}:${b.line}  ${b.cls}`);
console.error(
  `\nBậc hợp lệ: ${[...STEPS].sort((a, b) => a - b).join(", ")}\n` +
    `Sửa về một bậc có sẵn, hoặc khai thêm trong theme.extend.opacity của tailwind.config.ts.`
);
process.exit(1);
