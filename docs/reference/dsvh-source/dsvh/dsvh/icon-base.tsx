import type { ComponentType } from "react";

/**
 * Wrapper dùng chung cho MỌI icon Phosphor: giữ tên `*Icon` + default size,
 * map prop cũ width/height sang `size` của Phosphor. Port từ
 * sinh tự động — đừng sửa tay,
 * đồng bộ lại từ nguồn nếu đổi.
 */
export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export type IconProps = {
  size?: number | string;
  weight?: IconWeight;
  color?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  "aria-hidden"?: boolean;
};

export function icon(
  Base: ComponentType<Record<string, unknown>>,
  defaultWeight: IconWeight = "regular"
) {
  const Wrapped = ({ width, height, size, weight, ...rest }: IconProps) => {
    const resolved = size ?? width ?? height ?? 20;
    return <Base size={resolved} weight={weight ?? defaultWeight} {...rest} />;
  };
  return Wrapped;
}
