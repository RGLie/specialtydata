import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 자주 비활성화하는 규칙들
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn", // error -> warn으로 변경
      "@next/next/no-img-element": "off",
      
      // 필요에 따라 추가할 수 있는 규칙들 (주석 처리됨)
      // "@typescript-eslint/no-inferrable-types": "off",
      // "prefer-const": "off",
      // "no-console": "off",
    }
  }
];

export default eslintConfig;
