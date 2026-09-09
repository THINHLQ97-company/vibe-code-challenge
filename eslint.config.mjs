import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: ["docs/reference/**"] },
  {
    /**
     * `components/dsvh/**` là mã VENDOR — port nguyên văn từ design system DSVH của VAYS Panel
     * (nguồn sự thật: DSVH.html). Giữ byte-identical để còn đồng bộ lại được khi upstream đổi,
     * nên không sửa để chiều lint của repo này. Lỗi lint trong đó hạ xuống mức cảnh báo; code
     * do dự án tự viết (app/**, components/*.tsx) vẫn giữ nguyên mức chặn.
     */
    files: ["components/dsvh/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },
];

export default eslintConfig;
