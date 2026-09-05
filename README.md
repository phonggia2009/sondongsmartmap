# 🗺️ Sơn Đồng SmartMap — Bản Đồ Số Hành Chính Xã Sơn Đồng

> **Nền tảng WebGIS tương tác trực quan phục vụ công tác quản lý địa lý, hành chính và tra cứu thông tin dân sinh xã Sơn Đồng, huyện Hoài Đức, TP. Hà Nội.**

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan?logo=tailwindcss) ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)

---

## ✨ Tính Năng Nổi Bật

| Tính năng | Mô tả chi tiết |
|---|---|
| **Ranh giới hành chính 16 thôn** | Hiển thị đa giác GeoJSON ranh giới từng thôn/tổ dân phố, hiệu ứng marching-ants ranh giới xã, hover làm nổi bật và click xem chi tiết |
| **5 Lớp dữ liệu chuyên đề** | Chuyển đổi linh hoạt giữa: Thôn xã (🗺️), Trường học (🏫), Trạm Y Tế (🏥), Di tích lịch sử (🏛️), Cơ quan HCSN (🏢) |
| **Gom cụm điểm thông minh** | Tích hợp thư viện Supercluster tự động nhóm các điểm đánh dấu khi thu nhỏ bản đồ và giải cụm mượt mà khi phóng to |
| **Tìm kiếm nhanh & Phím tắt** | Chuẩn hóa tiếng Việt có dấu/không dấu; phím tắt **`Ctrl+K`** (hoặc **`⌘K`** trên macOS) mở nhanh thanh tìm kiếm |
| **Bản đồ nền đa dạng** | Tùy chọn 5 lớp nền: CartoDB Sáng, CartoDB Tối, Vệ tinh Esri World Imagery, Bản đồ đường phố Esri và OpenStreetMap |
| **Chỉ đường Google Maps** | Tích hợp nút điều hướng tự động mở Google Maps với tọa độ chính xác của địa điểm đã chọn |
| **Giao diện đáp ứng (Responsive)** | Tối ưu hóa cho máy tính để bàn (glassmorphism sidebar) và thiết bị di động (bottom sheet kéo vuốt tiện lợi) |
| **Chế độ Sáng/Tối (Dark Mode)** | Tự động thích ứng sở thích hệ thống và lưu trạng thái vào `localStorage` |
| **Hướng dẫn tương tác (Tour)** | Onboarding Tour 5 bước trực quan giúp người dùng mới nắm bắt toàn bộ tính năng |

---

## 🚀 Khởi Chạy Dự Án

### Cài đặt môi trường

```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ phát triển (Dev server)
npm run dev
```

Ứng dụng chạy mặc định tại: **http://localhost:5173**

### Kiểm tra & Đóng gói sản phẩm (Production)

```bash
# Kiểm tra kiểu TypeScript
npm run type-check

# Kiểm tra quy chuẩn mã nguồn ESLint
npm run lint

# Đóng gói sản xuất
npm run build

# Xem thử bản build
npm run preview
```

---

## 📁 Cấu Trúc Thư Mục

```
Map/
├── public/
│   ├── data/
│   │   ├── villages.json                         ← Dữ liệu 16 thôn xã Sơn Đồng
│   │   ├── danhsachtruongsausapxep.geojson       ← 14 trường học trên địa bàn
│   │   ├── tramyte.geojson                       ← Trạm y tế xã
│   │   ├── relics.json                           ← 24 di tích lịch sử xếp hạng
│   │   ├── danhsachdonvihanhchinhsunghiep.geojson← Đơn vị hành chính sự nghiệp
│   │   ├── danhgioixa.geojson                    ← Ranh giới toàn xã Sơn Đồng
│   │   ├── ranhgioithon.geojson                  ← Ranh giới đa giác 16 thôn
│   │   ├── thon_nhan_ten.geojson                 ← Điểm định vị nhãn tên thôn
│   │   └── dsdiemsinhoatcongdong.geojson         ← Danh sách điểm sinh hoạt cộng đồng
│   ├── favicon.svg & logo*.png                   ← Biểu trưng / Logo
├── src/
│   ├── components/
│   │   ├── Header/                               ← Thanh tiêu đề, logo, breadcrumb & nút tiện ích
│   │   ├── Sidebar/                              ← Thanh điều hướng, phân loại 5 lớp dữ liệu
│   │   ├── SearchBox/                            ← Hộp tìm kiếm tức thời với phím tắt Ctrl+K
│   │   ├── MapViewer/                            ← Trình hiển thị bản đồ Leaflet & các lớp dữ liệu
│   │   ├── InformationPanel/                     ← Bảng thông tin trượt chi tiết về thôn xã
│   │   ├── VillageCard/                          ← Thẻ hiển thị thôn trong danh sách
│   │   ├── Onboarding/                           ← Tour hướng dẫn tương tác cho người dùng mới
│   │   └── Loading/                              ← Màn hình chờ tải dữ liệu
│   ├── context/
│   │   ├── useAppContext.ts                      ← Định nghĩa kiểu, Context và hook useAppContext
│   │   └── AppContext.tsx                        ← AppProvider quản lý trạng thái giao diện toàn cục
│   ├── hooks/
│   │   ├── useVillages.ts                        ← React Query hook tải dữ liệu thôn
│   │   ├── useSchools.ts                         ← Hook tải dữ liệu trường học
│   │   ├── useHealthStations.ts                  ← Hook tải dữ liệu trạm y tế
│   │   ├── useRelics.ts                          ← Hook tải dữ liệu di tích
│   │   ├── useGovUnits.ts                        ← Hook tải dữ liệu cơ quan HCSN
│   │   ├── useGeoJSONLayers.ts                   ← Hook tải các lớp GeoJSON ranh giới
│   │   ├── useKeyboard.ts                        ← Lắng nghe phím tắt toàn cục
│   │   ├── useTheme.ts                           ← Quản lý Dark/Light mode
│   │   └── useFullscreen.ts                      ← Quản lý chế độ Toàn màn hình
│   ├── services/
│   │   └── dataService.ts                        ← Tầng kết nối & chuẩn hóa dữ liệu
│   ├── config/
│   │   └── index.ts                              ← Tùy biến thông tin đơn vị & màu sắc chủ đạo
│   └── types/
│       ├── index.ts                              ← Kiểu dữ liệu chính cho thôn, POI và cấu hình
│       └── poi.ts                                ← Kiểu dữ liệu lớp điểm POI
└── README.md
```

---

## ⌨️ Phím Tắt Tiện Ích

| Phím tắt | Thao tác |
|---|---|
| `Ctrl + K` / `⌘ + K` | Mở nhanh hộp tìm kiếm và đưa con trỏ vào ô nhập |
| `Escape` | Hủy chọn thôn / Đóng cửa sổ chi tiết / Xóa từ khóa tìm kiếm |
| `Mũi tên lên / xuống` | Di chuyển giữa các kết quả tìm kiếm trong danh sách |

---

## ⚙️ Tùy Biến Đơn Vị Quản Lý

Bạn có thể chỉnh sửa tệp `src/config/index.ts` để cập nhật thông tin chính quyền địa phương:

```typescript
export const APP_CONFIG: AppConfig = {
  title: 'Bản đồ xã Sơn Đồng',
  subtitle: 'UBND Xã Sơn Đồng',
  organization: 'Bản đồ hành chính sau sáp nhập',
  logo: null,

  colors: {
    primary: '#1e3a8a',   // Màu xanh hành chính
    accent:  '#3b82f6',   // Màu xanh tương tác
    gold:    '#f59e0b',   // Màu vàng nhấn nổi bật
  },

  animation: {
    duration: 400,
    ease: 'easeInOut',
  },

  paths: {
    data: '/data',
  },
};
```

---

## 📝 Bản Quyền

Hệ thống phục vụ công tác chuyển đổi số và quản lý nội bộ của UBND Xã Sơn Đồng.
