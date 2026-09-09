import { icon } from "./icon-base";
import {
  Eye,
  EyeSlash,
  EnvelopeSimple,
  LockSimple,
  User,
  Rocket,
  Globe,
  ShieldCheck,
  House,
  Sun,
  Moon,
  CardsThree,
  Database,
  UsersThree,
  Stack,
  PlugsConnected,
  HardDrives,
  Notepad,
  Gear,
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
  DotsThreeVertical,
  Star as StarPh,
  X,
  SidebarSimple,
  Tray,
  Archive,
  Storefront,
  SignOut,
  List,
  Info,
  CheckCircle,
  Warning,
  XCircle,
  MagnifyingGlass,
  ArrowClockwise,
  ClockCounterClockwise,
  CalendarBlank,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Icon DSVH — repo này tự sở hữu (tách khỏi vibe-host-ui 05/08/2026). Alias thủ
 * công dưới đây (tên/weight riêng theo convention DSVH) THẮNG khi trùng tên
 * với `icons-phosphor.generated` (toàn bộ ~1530 icon Phosphor, export cuối
 * file) — xem components.md/do-dont.md, KHÔNG tự vẽ SVG tay.
 */
export const EyeIcon = icon(Eye);
export const EyeSlashIcon = icon(EyeSlash);
export const EnvelopeIcon = icon(EnvelopeSimple);
export const LockIcon = icon(LockSimple);
export const UserIcon = icon(User);
export const RocketIcon = icon(Rocket);
export const GlobeIcon = icon(Globe);
export const ShieldIcon = icon(ShieldCheck);
export const HouseIcon = icon(House);
export const SunIcon = icon(Sun);
export const MoonIcon = icon(Moon);
export const CardsIcon = icon(CardsThree);
export const DatabaseIcon = icon(Database);
export const UsersIcon = icon(UsersThree);
export const StackIcon = icon(Stack);
export const PlugIcon = icon(PlugsConnected);
export const HardDriveIcon = icon(HardDrives);
export const NotepadIcon = icon(Notepad);
// Cấu hình hệ thống (/admin/settings). Dùng bộ DSVH cho khớp phần còn lại của sidebar —
// lucide đã bị gỡ khỏi thanh điều hướng ở đợt giao diện mới.
export const GearIcon = icon(Gear);
export const ChevronDownIcon = icon(CaretDown, "bold");
export const ChevronUpIcon = icon(CaretUp, "bold");
export const ChevronLeftIcon = icon(CaretLeft, "bold");
export const ChevronRightIcon = icon(CaretRight, "bold");
export const DotsIcon = icon(DotsThreeVertical, "bold");
export const StarIcon = icon(StarPh, "fill");
export const Star = StarIcon;
export const CloseIcon = icon(X, "bold");
export const SidebarIcon = icon(SidebarSimple);
// Riêng của VAYS: backup/legacy-backup/store/logout.
export const BackupIcon = icon(Tray);
export const ArchiveIcon = icon(Archive);
export const StoreIcon = icon(Storefront);
export const SignOutIcon = icon(SignOut);
export const ListIcon = icon(List, "bold");
export const InfoIcon = icon(Info, "bold");
export const CheckCircleIcon = icon(CheckCircle, "bold");
export const WarningIcon = icon(Warning, "bold");
export const ErrorIcon = icon(XCircle, "bold");
// Bổ sung 05/08 khi port nhóm component còn thiếu (Command/LogViewer/TableToolbar/RepoPicker dùng
// SearchIcon; FileUpload dùng RefreshIcon; DeploymentTimeline dùng RollbackIcon). Giữ đúng tên +
// weight như bản gốc để code port sang không phải sửa.
export const SearchIcon = icon(MagnifyingGlass);
export const RefreshIcon = icon(ArrowClockwise, "bold");
export const RollbackIcon = icon(ClockCounterClockwise);
// Bổ sung 15/08 cho màn "Dịch vụ của tôi" (hạn dịch vụ). `CalendarBlank` chứ không phải `Calendar`
// của Phosphor: bản `Calendar` vẽ sẵn các chấm ngày bên trong, ở cỡ 16–20px chúng nhoè thành một
// mảng xám và mất hẳn hình cuốn lịch. Ô trống đọc rõ hơn ở mọi cỡ ta đang dùng.
export const CalendarIcon = icon(CalendarBlank);

/** Lunor mark — rounded gradient tile with a white infinity/spiral glyph. */
export function LunorMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[11px] shadow-sm"
      style={{
        width: size,
        height: size,
        // ds-allow-hex: gradient logo nhận diện thương hiệu — màu cố định theo brand, KHÔNG đổi
        // theo theme (giống brand-icons của Google/GitHub). Không token hoá.
        background: "linear-gradient(140deg,#ff8a3d 0%,#f5601f 55%,#e23c00 100%)",
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M8.5 8.5c2.3-2.3 4.7-2.3 7 0 2.3 2.3 2.3 4.7 0 7-2.3 2.3-4.7 2.3-7 0M15.5 15.5c-2.3 2.3-4.7 2.3-7 0-2.3-2.3-2.3-4.7 0-7"
          stroke="#fff" /* ds-allow-hex: nét trắng trên nền logo, cùng lý do gradient trên */
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * TOÀN BỘ thư viện Phosphor dạng `*Icon` (auto-gen, ~1530 icon). Import bất kỳ
 * icon nào cũng được. Alias/weight thủ công ở TRÊN thắng khi trùng tên.
 * Sinh lại bằng scripts/ds/gen-icons (Phosphor) — đừng sửa tay.
 */
export * from "./icons-phosphor.generated";
