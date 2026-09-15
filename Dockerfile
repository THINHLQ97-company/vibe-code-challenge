FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    else \
      npm ci; \
    fi

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm build; else npm run build; fi

FROM node:22-alpine AS runner
WORKDIR /app
# `HOSTNAME=0.0.0.0` là BẮT BUỘC cho bản standalone của Next: mặc định `server.js` bind vào
# hostname của container (đo được: "Local: http://f7babb02190f:3000"), tức KHÔNG nghe trên
# 127.0.0.1. Truy cập từ ngoài qua cổng đã map vẫn chạy, nhưng HEALTHCHECK gọi localhost thì bị
# "Connection refused" → container báo unhealthy suốt dù app hoàn toàn bình thường.
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# `--chown` cho CẢ thư mục public: ba dòng COPY còn lại đều có, riêng dòng này thiếu nên thư mục
# thuộc về root trong khi tiến trình chạy bằng người dùng `nextjs`. Next standalone quét thư mục
# này lúc khởi động để dựng danh sách tệp tĩnh — không đọc được là chết ngay, lặp thành crash-loop.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Bản standalone chỉ gói mã JS được truy vết, KHÔNG gói file .sql. Mà `instrumentation.ts` chạy
# migration lúc khởi động lại đọc thẳng thư mục này — thiếu nó thì container lên xanh nhưng
# database rỗng không bảng.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
USER nextjs
EXPOSE 3000
# `127.0.0.1` chứ KHÔNG `localhost`: trong container, `localhost` phân giải ra `::1` (IPv6) TRƯỚC
# theo /etc/hosts, mà Next standalone chỉ nghe IPv4 `0.0.0.0` — nên healthcheck báo "Connection
# refused" vĩnh viễn dù app hoàn toàn bình thường. Đã đo: 127.0.0.1 trả OK, localhost bị từ chối.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
