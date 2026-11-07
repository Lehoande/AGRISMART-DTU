// AgriSmart AI - tập trung NÔNG SẢN + TRÁI CÂY
import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Carrot,
  Wheat,
  Sprout,
  Citrus,
  Cherry,
  Grape,
  Pepper,
  Leaf,
} from "lucide-react";

export type Cert = "organic" | "vietgap" | "ocop" | "globalgap";
export type Region = "mientay" | "taynguyen" | "mienbac" | "mientrung";

export type Product = {
  id: string;
  name: string;
  category: "traicay" | "raucu" | "nongsan" | "theomua" | "noibat" | "uudai";
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  unit: string;
  cert: Cert;
  certLabel: string;
  region: Region;
  regionLabel: string;
  rating: number;
  reviews: number;
  seller: string;
  sellerRating: number;
  image: string;
  desc: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  // AgriSmart Verified info
  batchId: string;
  harvestDate: string;
  inspectionDate: string;
  inspector: string;
  storageCondition: string;
  stock: number;
};

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  hoverColor: string;
  count: string;
};

// CHỈ nông sản + trái cây - KHÔNG có quần áo, điện tử, mỹ phẩm
export const categories: Category[] = [
  {
    id: "traicay",
    name: "Trái Cây",
    icon: Apple,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    hoverColor: "group-hover:bg-rose-500 group-hover:text-white",
    count: "85+ sản phẩm",
  },
  {
    id: "raucu",
    name: "Rau Củ",
    icon: Carrot,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverColor: "group-hover:bg-green-600 group-hover:text-white",
    count: "120+ sản phẩm",
  },
  {
    id: "nongsan",
    name: "Nông Sản Khác",
    icon: Wheat,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    hoverColor: "group-hover:bg-amber-500 group-hover:text-white",
    count: "60+ sản phẩm",
  },
  {
    id: "theomua",
    name: "Nông Sản Theo Mùa",
    icon: Sprout,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverColor: "group-hover:bg-emerald-600 group-hover:text-white",
    count: "Theo mùa vụ",
  },
  {
    id: "noibat",
    name: "Sản Phẩm Nổi Bật",
    icon: Cherry,
    color: "text-red-500",
    bgColor: "bg-red-50",
    hoverColor: "group-hover:bg-red-500 group-hover:text-white",
    count: "Tuyển chọn",
  },
  {
    id: "uudai",
    name: "Đang Có Ưu Đãi",
    icon: Citrus,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    hoverColor: "group-hover:bg-orange-500 group-hover:text-white",
    count: "Giảm giá",
  },
];

const IMG = {
  durian: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
  orange: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80",
  dragonfruit: "https://images.unsplash.com/photo-1551024601-bec78aea704d?auto=format&fit=crop&w=600&q=80",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
  rambutan: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80",
  longan: "https://images.unsplash.com/photo-1591287857674-20d7d39c1aef?auto=format&fit=crop&w=600&q=80",
  tomato: "https://images.unsplash.com/photo-1546470427-e52f5b1e3b8e?auto=format&fit=crop&w=600&q=80",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
  carrot: "https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&w=600&q=80",
  cabbage: "https://images.unsplash.com/photo-1518843875785-3c6e1c16d3bc?auto=format&fit=crop&w=600&q=80",
  cucumber: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
  pepper: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&w=600&q=80",
  honey: "https://images.unsplash.com/photo-1587049332836-3c6e9a4f7c8b?auto=format&fit=crop&w=600&q=80",
  tea: "https://images.unsplash.com/photo-1599909533730-b35c2a1c8b3d?auto=format&fit=crop&w=600&q=80",
  grape: "https://images.unsplash.com/photo-1599909533730-b35c2a1c8b3d?auto=format&fit=crop&w=600&q=80",
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Sầu Riêng Ri6 Đắk Lắk",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 145000,
    oldPrice: 180000,
    unit: "kg",
    cert: "ocop",
    certLabel: "OCOP 5 SAO",
    region: "taynguyen",
    regionLabel: "Đắk Lắk, Tây Nguyên",
    rating: 4.9,
    reviews: 128,
    seller: "HTX Nông Nghiệp Krông Pắc",
    sellerRating: 4.8,
    image: IMG.durian,
    desc: "Sầu riêng Ri6 chính gốc Đắk Lắk, cơm vàng, hạt lép, mùi thơm nồng nàn. Thu hoạch chuẩn độ chín 85-90%.",
    isBestSeller: true,
    batchId: "AGR-2026-DL-001",
    harvestDate: "28/10/2026",
    inspectionDate: "29/10/2026",
    inspector: "Nguyễn Thị Mai - KS AgriSmart",
    storageCondition: "Nhiệt độ phòng, tránh ánh nắng",
    stock: 320,
  },
  {
    id: "p2",
    name: "Xoài Cát Hòa Lộc Tiền Giang",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 85000,
    oldPrice: 105000,
    unit: "kg",
    cert: "ocop",
    certLabel: "OCOP 4 SAO",
    region: "mientay",
    regionLabel: "Tiền Giang, Miền Tây",
    rating: 4.7,
    reviews: 64,
    seller: "HTX Xoài Hòa Lộc",
    sellerRating: 4.6,
    image: IMG.mango,
    desc: "Xoài Cát Hòa Lộc trái to tròn, thịt dày mịn không xơ, vị ngọt đậm đà, hương thơm dễ chịu.",
    isBestSeller: true,
    batchId: "AGR-2026-TG-014",
    harvestDate: "26/10/2026",
    inspectionDate: "27/10/2026",
    inspector: "Trần Văn Hùng - KS AgriSmart",
    storageCondition: "Nơi thoáng mát, tránh ánh nắng",
    stock: 180,
  },
  {
    id: "p3",
    name: "Cam Sành Hà Giang Cổ Thụ",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 42000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "mienbac",
    regionLabel: "Hà Giang, Miền Bắc",
    rating: 4.8,
    reviews: 267,
    seller: "Vườn Cam Bảo Lộc",
    sellerRating: 4.9,
    image: IMG.orange,
    desc: "Cam sành cổ thụ Hà Giang, vỏ mỏng, nhiều nước, vị chua ngọt hài hòa, giàu vitamin C.",
    isBestSeller: true,
    batchId: "AGR-2026-HG-008",
    harvestDate: "20/10/2026",
    inspectionDate: "21/10/2026",
    inspector: "Lê Thị Hoa - KS AgriSmart",
    storageCondition: "Nhiệt độ phòng, dùng trong 14 ngày",
    stock: 240,
  },
  {
    id: "p4",
    name: "Thanh Long Ruột Đỏ Bình Thuận",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 25000,
    oldPrice: 32000,
    unit: "kg",
    cert: "vietgap",
    certLabel: "VietGAP",
    region: "mientrung",
    regionLabel: "Bình Thuận",
    rating: 4.6,
    reviews: 198,
    seller: "HTX Thanh Long Bình Thuận",
    sellerRating: 4.5,
    image: IMG.dragonfruit,
    desc: "Thanh long ruột đỏ Bình Thuận, ngọt thanh, thịt dày, giàu chất chống oxy hóa.",
    isNew: true,
    batchId: "AGR-2026-BT-022",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Phạm Văn Nam - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 7 ngày",
    stock: 410,
  },
  {
    id: "p5",
    name: "Chuối Tiêu Hữu Cơ Hưng Yên",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 22000,
    oldPrice: 28000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "mienbac",
    regionLabel: "Hưng Yên",
    rating: 4.6,
    reviews: 145,
    seller: "Nông trại Banana House",
    sellerRating: 4.7,
    image: IMG.banana,
    desc: "Chuối tiêu chín tự nhiên, ngọt và bùi, giàu kali. Không sử dụng chất ép chín hóa học.",
    batchId: "AGR-2026-HY-005",
    harvestDate: "26/10/2026",
    inspectionDate: "27/10/2026",
    inspector: "Nguyễn Thị Mai - KS AgriSmart",
    storageCondition: "Nhiệt độ phòng",
    stock: 280,
  },
  {
    id: "p6",
    name: "Chôm Chôm Thái Bình",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 38000,
    unit: "kg",
    cert: "vietgap",
    certLabel: "VietGAP",
    region: "mienbac",
    regionLabel: "Thái Bình",
    rating: 4.5,
    reviews: 89,
    seller: "Vườn Chôm Chôm Thái Bình",
    sellerRating: 4.4,
    image: IMG.rambutan,
    desc: "Chôm chôm Thái Bình vỏ đỏ tươi, cùi trắng ngọt, hạt dễ tách, thơm nhẹ.",
    isNew: true,
    batchId: "AGR-2026-TB-011",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Trần Văn Hùng - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 5 ngày",
    stock: 150,
  },
  {
    id: "p7",
    name: "Nhãn Lồng Hưng Yên",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 45000,
    oldPrice: 55000,
    unit: "kg",
    cert: "ocop",
    certLabel: "OCOP 4 SAO",
    region: "mienbac",
    regionLabel: "Hưng Yên",
    rating: 4.8,
    reviews: 176,
    seller: "HTX Nhãn Lồng Khoái Châu",
    sellerRating: 4.7,
    image: IMG.longan,
    desc: "Nhãn lồng Hưng Yên đặc sản, cùi dày giòn ngọt, hạt nhỏ, thơm đặc trưng.",
    isBestSeller: true,
    batchId: "AGR-2026-HY-019",
    harvestDate: "25/10/2026",
    inspectionDate: "26/10/2026",
    inspector: "Lê Thị Hoa - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 7 ngày",
    stock: 220,
  },
  {
    id: "p8",
    name: "Nho Ninh Thuận Hữu Cơ",
    category: "traicay",
    categoryLabel: "Trái Cây",
    price: 95000,
    oldPrice: 120000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "mientrung",
    regionLabel: "Ninh Thuận",
    rating: 4.7,
    reviews: 134,
    seller: "Vườn Nho Ninh Thuận",
    sellerRating: 4.8,
    image: IMG.grape,
    desc: "Nho Ninh Thuận đỏ hữu cơ, quả to mọng nước, ngọt đậm, giàu resveratrol.",
    isNew: true,
    batchId: "AGR-2026-NT-007",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Phạm Văn Nam - KS AgriSmart",
    storageCondition: "Tủ lạnh 4°C, dùng trong 10 ngày",
    stock: 95,
  },
  {
    id: "p9",
    name: "Cà Chua Đà Lạt Hữu Cơ",
    category: "raucu",
    categoryLabel: "Rau Củ",
    price: 38000,
    oldPrice: 45000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "taynguyen",
    regionLabel: "Đà Lạt, Lâm Đồng",
    rating: 4.7,
    reviews: 156,
    seller: "HTX Nông Sản Xanh Đà Lạt",
    sellerRating: 4.8,
    image: IMG.tomato,
    desc: "Cà chua Đà Lạt chín cây, đỏ tự nhiên, ngọt thanh, lý tưởng cho salad và nấu ăn.",
    isBestSeller: true,
    batchId: "AGR-2026-DL-012",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Nguyễn Thị Mai - KS AgriSmart",
    storageCondition: "Nhiệt độ phòng, dùng trong 7 ngày",
    stock: 180,
  },
  {
    id: "p10",
    name: "Rau Cải Bó Xôi Thủy Canh Mộc Châu",
    category: "raucu",
    categoryLabel: "Rau Củ",
    price: 35000,
    oldPrice: 42000,
    unit: "Túi 500g",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "mienbac",
    regionLabel: "Mộc Châu, Sơn La",
    rating: 4.8,
    reviews: 95,
    seller: "Trang trại Mộc Châu Eco",
    sellerRating: 4.7,
    image: IMG.spinach,
    desc: "Rau cải bó xôi trồng thủy canh không dư lượng thuốc trừ sâu, giàu sắt và vitamin.",
    batchId: "AGR-2026-MS-004",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Trần Văn Hùng - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 5 ngày",
    stock: 320,
  },
  {
    id: "p11",
    name: "Cà Rốt Đà Lạt Tươi",
    category: "raucu",
    categoryLabel: "Rau Củ",
    price: 28000,
    oldPrice: 35000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "taynguyen",
    regionLabel: "Đà Lạt, Lâm Đồng",
    rating: 4.6,
    reviews: 42,
    seller: "Nông Trại Dalat Bio",
    sellerRating: 4.6,
    image: IMG.carrot,
    desc: "Cà rốt Đà Lạt củ nhỏ chắc, ngọt thanh, giàu Beta-carotene, không chất bảo quản.",
    batchId: "AGR-2026-DL-023",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Lê Thị Hoa - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 10 ngày",
    stock: 250,
  },
  {
    id: "p12",
    name: "Bắp Cải Xanh Mộc Châu",
    category: "raucu",
    categoryLabel: "Rau Củ",
    price: 18000,
    unit: "kg",
    cert: "vietgap",
    certLabel: "VietGAP",
    region: "mienbac",
    regionLabel: "Mộc Châu, Sơn La",
    rating: 4.5,
    reviews: 87,
    seller: "Green Valley Mộc Châu",
    sellerRating: 4.5,
    image: IMG.cabbage,
    desc: "Bắp cải xanh Mộc Châu giòn ngọt, trồng khí hậu mát, lý tưởng cho xào và canh.",
    batchId: "AGR-2026-MS-016",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Phạm Văn Nam - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 14 ngày",
    stock: 190,
  },
  {
    id: "p13",
    name: "Dưa Leo Nhật Bản Đà Lạt",
    category: "raucu",
    categoryLabel: "Rau Củ",
    price: 32000,
    oldPrice: 38000,
    unit: "kg",
    cert: "globalgap",
    certLabel: "GlobalGAP",
    region: "taynguyen",
    regionLabel: "Đà Lạt, Lâm Đồng",
    rating: 4.7,
    reviews: 142,
    seller: "HTX Rau Sạch An Lạc",
    sellerRating: 4.8,
    image: IMG.cucumber,
    desc: "Dưa leo Nhật Bản Đà Lạt, giòn mọng, ít hạt, vỏ mỏng, phù hợp ăn sống và salad.",
    isNew: true,
    batchId: "AGR-2026-DL-027",
    harvestDate: "27/10/2026",
    inspectionDate: "28/10/2026",
    inspector: "Nguyễn Thị Mai - KS AgriSmart",
    storageCondition: "Tủ lạnh, dùng trong 7 ngày",
    stock: 160,
  },
  {
    id: "p14",
    name: "Gạo Thơm ST25 Sóc Trăng",
    category: "nongsan",
    categoryLabel: "Nông Sản",
    price: 195000,
    oldPrice: 220000,
    unit: "Túi 5kg",
    cert: "vietgap",
    certLabel: "VietGAP",
    region: "mientay",
    regionLabel: "Sóc Trăng, Miền Tây",
    rating: 5.0,
    reviews: 310,
    seller: "DNTN Hồ Quang Trí",
    sellerRating: 4.9,
    image: IMG.rice,
    desc: "Gạo ngon nhất thế giới ST25, hạt dài trắng trong, cơm dẻo, thơm hương lá dứa.",
    isBestSeller: true,
    batchId: "AGR-2026-ST-001",
    harvestDate: "Vụ Đông Xuân 2026",
    inspectionDate: "15/09/2026",
    inspector: "Trần Văn Hùng - KS AgriSmart",
    storageCondition: "Nơi khô ráo, thoáng mát",
    stock: 480,
  },
  {
    id: "p15",
    name: "Cà Phê Robusta Cầu Đất",
    category: "nongsan",
    categoryLabel: "Nông Sản",
    price: 220000,
    oldPrice: 260000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "taynguyen",
    regionLabel: "Đà Lạt, Lâm Đồng",
    rating: 4.9,
    reviews: 287,
    seller: "Cầu Đất Coffee Estate",
    sellerRating: 4.9,
    image: IMG.coffee,
    desc: "Cà phê Robusta single origin từ Cầu Đất 1500m. Hương sô-cô-la, hạt dẻ, đậm đà.",
    isBestSeller: true,
    batchId: "AGR-2026-CD-003",
    harvestDate: "Vụ 2026",
    inspectionDate: "01/10/2026",
    inspector: "Lê Thị Hoa - KS AgriSmart",
    storageCondition: "Đóng gói chân không",
    stock: 120,
  },
  {
    id: "p16",
    name: "Tiêu Xanh Tây Nguyên",
    category: "nongsan",
    categoryLabel: "Nông Sản",
    price: 145000,
    oldPrice: 175000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "taynguyen",
    regionLabel: "Đắk Lắk, Tây Nguyên",
    rating: 4.8,
    reviews: 134,
    seller: "HTX Tiêu Đắk Lắk",
    sellerRating: 4.7,
    image: IMG.pepper,
    desc: "Tiêu xanh tươi thu hoạch Đắk Lắk, thơm nồng, cay nhẹ, hoàn hảo cho món Việt.",
    batchId: "AGR-2026-DL-031",
    harvestDate: "20/10/2026",
    inspectionDate: "21/10/2026",
    inspector: "Phạm Văn Nam - KS AgriSmart",
    storageCondition: "Nơi khô ráo",
    stock: 90,
  },
  {
    id: "p17",
    name: "Mật Ong Rừng U Minh",
    category: "nongsan",
    categoryLabel: "Nông Sản",
    price: 195000,
    unit: "lít",
    cert: "ocop",
    certLabel: "OCOP 4 SAO",
    region: "mientrung",
    regionLabel: "Cà Mau",
    rating: 4.8,
    reviews: 156,
    seller: "HTX Ong Mật U Minh",
    sellerRating: 4.8,
    image: IMG.honey,
    desc: "Mật ong rừng U Minh Hạ, giàu enzyme và chất chống oxy hóa, hương hoa đặc trưng.",
    isNew: true,
    batchId: "AGR-2026-CM-002",
    harvestDate: "Vụ 2026",
    inspectionDate: "10/09/2026",
    inspector: "Nguyễn Thị Mai - KS AgriSmart",
    storageCondition: "Nhiệt độ phòng, tránh ánh nắng",
    stock: 60,
  },
  {
    id: "p18",
    name: "Trà Shan Tuyết Cổ Thụ Hà Giang",
    category: "nongsan",
    categoryLabel: "Nông Sản",
    price: 380000,
    oldPrice: 450000,
    unit: "kg",
    cert: "organic",
    certLabel: "ORGANIC",
    region: "mienbac",
    regionLabel: "Hà Giang",
    rating: 4.9,
    reviews: 98,
    seller: "HTX Trà Shan Tuyết Hà Giang",
    sellerRating: 5.0,
    image: IMG.tea,
    desc: "Trà cổ thụ Shan Tuyết 200 năm tuổi Hà Giang. Hái tay, ủ tự nhiên, hương phức tạp.",
    isBestSeller: true,
    batchId: "AGR-2026-HG-014",
    harvestDate: "Xuân 2026",
    inspectionDate: "15/04/2026",
    inspector: "Trần Văn Hùng - KS AgriSmart",
    storageCondition: "Đóng gói chân không",
    stock: 35,
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

// AI Center modules
export const aiModules = [
  {
    id: "classify",
    title: "AI Product Classification",
    viTitle: "Phân loại nông sản",
    desc: "Tự động hỗ trợ phân loại nông sản từ hình ảnh và dữ liệu. AI nhận diện nhóm trái cây, rau củ, nông sản.",
    icon: "🏷️",
    color: "from-emerald-500 to-green-600",
    metric: "94.2% accuracy",
  },
  {
    id: "anomaly",
    title: "AI Quality Anomaly Detection",
    viTitle: "Phát hiện bất thường chất lượng",
    desc: "Phát hiện dấu hiệu bất thường trên hình ảnh để hỗ trợ nhân viên kiểm tra - dấu hiệu sâu bệnh, dập nát, đổi màu.",
    icon: "🔍",
    color: "from-amber-500 to-orange-600",
    metric: "12 alerts today",
  },
  {
    id: "order",
    title: "AI Order Verification",
    viTitle: "Kiểm tra điều kiện đơn hàng",
    desc: "Kiểm tra điều kiện đơn hàng trước khi xử lý - tồn kho, lô hàng, thông tin giao hàng, điều kiện bảo quản.",
    icon: "✅",
    color: "from-blue-500 to-indigo-600",
    metric: "847 orders verified",
  },
  {
    id: "recommend",
    title: "AI Recommendation",
    viTitle: "Đề xuất nông sản phù hợp",
    desc: "Đề xuất nông sản phù hợp với sở thích, lịch sử mua hàng và xu hướng mùa vụ của người mua.",
    icon: "💡",
    color: "from-purple-500 to-fuchsia-600",
    metric: "2.3M suggestions",
  },
  {
    id: "supply",
    title: "AI Supply Analysis",
    viTitle: "Phân tích nguồn cung",
    desc: "Phân tích xu hướng bán hàng, tồn kho và nguồn cung để hỗ trợ quyết định nhập hàng và điều phối.",
    icon: "📊",
    color: "from-rose-500 to-red-600",
    metric: "Real-time tracking",
  },
  {
    id: "risk",
    title: "AI Risk Alert",
    viTitle: "Cảnh báo rủi ro",
    desc: "Cảnh báo các giao dịch hoặc lô hàng có dấu hiệu bất thường, hỗ trợ phòng ngừa rủi ro.",
    icon: "⚠️",
    color: "from-red-500 to-rose-700",
    metric: "3 active alerts",
  },
];

// Lô hàng mẫu
export type BatchStatus = "pending" | "inspecting" | "passed" | "rejected" | "quarantined" | "selling" | "soldout";

export const batchStatusConfig: Record<
  BatchStatus,
  { label: string; labelEn: string; color: string; canSell: boolean }
> = {
  pending: { label: "Chờ kiểm tra", labelEn: "PENDING INSPECTION", color: "bg-amber-100 text-amber-700 border-amber-300", canSell: false },
  inspecting: { label: "Đang kiểm tra", labelEn: "INSPECTING", color: "bg-blue-100 text-blue-700 border-blue-300", canSell: false },
  passed: { label: "Đạt yêu cầu", labelEn: "PASSED", color: "bg-green-100 text-green-700 border-green-300", canSell: false },
  selling: { label: "Đang bán", labelEn: "SELLING", color: "bg-emerald-100 text-emerald-700 border-emerald-300", canSell: true },
  quarantined: { label: "Cách ly", labelEn: "QUARANTINED", color: "bg-orange-100 text-orange-700 border-orange-300", canSell: false },
  rejected: { label: "Không đạt", labelEn: "REJECTED", color: "bg-red-100 text-red-700 border-red-300", canSell: false },
  soldout: { label: "Đã hết hàng", labelEn: "SOLD OUT", color: "bg-gray-100 text-gray-700 border-gray-300", canSell: false },
};

export type Batch = {
  id: string;
  productId: string;
  productName: string;
  image: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  origin: string;
  inspectionDate: string;
  inspector: string;
  status: BatchStatus;
  history: { date: string; action: string; user: string }[];
};

export const batches: Batch[] = [
  {
    id: "AGR-2026-DL-001",
    productId: "p1",
    productName: "Sầu Riêng Ri6 Đắk Lắk",
    image: IMG.durian,
    harvestDate: "28/10/2026",
    quantity: 320,
    unit: "kg",
    origin: "Krông Pắc, Đắk Lắk",
    inspectionDate: "29/10/2026",
    inspector: "Nguyễn Thị Mai",
    status: "selling",
    history: [
      { date: "28/10/2026 08:00", action: "Tiếp nhận lô hàng", user: "Hệ thống" },
      { date: "28/10/2026 14:30", action: "AI phân tích hình ảnh", user: "AI Engine" },
      { date: "29/10/2026 09:15", action: "Kiểm định chất lượng", user: "Nguyễn Thị Mai" },
      { date: "29/10/2026 10:00", action: "Đạt chuẩn - mở bán", user: "Nguyễn Thị Mai" },
    ],
  },
  {
    id: "AGR-2026-TG-014",
    productId: "p2",
    productName: "Xoài Cát Hòa Lộc Tiền Giang",
    image: IMG.mango,
    harvestDate: "26/10/2026",
    quantity: 180,
    unit: "kg",
    origin: "Cao Lãnh, Tiền Giang",
    inspectionDate: "27/10/2026",
    inspector: "Trần Văn Hùng",
    status: "selling",
    history: [
      { date: "26/10/2026 07:00", action: "Tiếp nhận lô hàng", user: "Hệ thống" },
      { date: "26/10/2026 11:00", action: "AI phân tích hình ảnh", user: "AI Engine" },
      { date: "27/10/2026 08:30", action: "Kiểm định chất lượng", user: "Trần Văn Hùng" },
      { date: "27/10/2026 09:00", action: "Đạt chuẩn - mở bán", user: "Trần Văn Hùng" },
    ],
  },
  {
    id: "AGR-2026-MS-031",
    productId: "p10",
    productName: "Rau Cải Bó Xôi Mộc Châu (Lô mới)",
    image: IMG.spinach,
    harvestDate: "29/10/2026",
    quantity: 80,
    unit: "kg",
    origin: "Mộc Châu, Sơn La",
    inspectionDate: "—",
    inspector: "—",
    status: "pending",
    history: [
      { date: "29/10/2026 06:00", action: "Tiếp nhận lô hàng", user: "Hệ thống" },
      { date: "29/10/2026 06:30", action: "Chờ phân công kiểm tra", user: "Hệ thống" },
    ],
  },
  {
    id: "AGR-2026-BT-022",
    productId: "p4",
    productName: "Thanh Long Ruột Đỏ Bình Thuận",
    image: IMG.dragonfruit,
    harvestDate: "27/10/2026",
    quantity: 410,
    unit: "kg",
    origin: "Hàm Thuận Nam, Bình Thuận",
    inspectionDate: "28/10/2026",
    inspector: "Phạm Văn Nam",
    status: "inspecting",
    history: [
      { date: "27/10/2026 09:00", action: "Tiếp nhận lô hàng", user: "Hệ thống" },
      { date: "27/10/2026 13:00", action: "AI phát hiện dấu hiệu bất thường", user: "AI Engine" },
      { date: "28/10/2026 08:00", action: "Đang kiểm tra chi tiết", user: "Phạm Văn Nam" },
    ],
  },
  {
    id: "AGR-2026-HY-005",
    productId: "p5",
    productName: "Chuối Tiêu Hưng Yên (Lô cách ly)",
    image: IMG.banana,
    harvestDate: "26/10/2026",
    quantity: 60,
    unit: "kg",
    origin: "Hưng Yên",
    inspectionDate: "27/10/2026",
    inspector: "Nguyễn Thị Mai",
    status: "quarantined",
    history: [
      { date: "26/10/2026 07:00", action: "Tiếp nhận lô hàng", user: "Hệ thống" },
      { date: "26/10/2026 10:00", action: "AI cảnh báo dấu hiệu bất thường", user: "AI Engine" },
      { date: "27/10/2026 09:00", action: "Cách ly để kiểm tra thêm", user: "Nguyễn Thị Mai" },
    ],
  },
];

// Đơn hàng mẫu (admin + seller)
export type OrderStatus =
  | "placed"
  | "ai_checking"
  | "received"
  | "packing"
  | "storage"
  | "shipping"
  | "delivered"
  | "completed";

export const orderStatusConfig: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  placed: { label: "Đã đặt hàng", color: "bg-blue-100 text-blue-700" },
  ai_checking: { label: "AI kiểm tra điều kiện", color: "bg-purple-100 text-purple-700" },
  received: { label: "AgriSmart tiếp nhận", color: "bg-indigo-100 text-indigo-700" },
  packing: { label: "Đang đóng gói", color: "bg-amber-100 text-amber-700" },
  storage: { label: "Đang bảo quản", color: "bg-cyan-100 text-cyan-700" },
  shipping: { label: "Đang giao", color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
};

export const orderTimeline: OrderStatus[] = [
  "placed",
  "ai_checking",
  "received",
  "packing",
  "storage",
  "shipping",
  "delivered",
];

export type Order = {
  id: string;
  customer: string;
  customerAvatar: string;
  items: { productId: string; productName: string; image: string; qty: number; price: number; batchId: string }[];
  total: number;
  fee: number;
  net: number;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: string;
  address: string;
};

export const sellerOrders: Order[] = [
  {
    id: "AGR-ORD-2847",
    customer: "Nguyễn Thị Lan",
    customerAvatar: "https://i.pravatar.cc/100?img=44",
    items: [
      { productId: "p1", productName: "Sầu Riêng Ri6 Đắk Lắk", image: IMG.durian, qty: 2, price: 145000, batchId: "AGR-2026-DL-001" },
    ],
    total: 290000,
    fee: 15000,
    net: 275000,
    placedAt: "29/10/2026 14:23",
    status: "shipping",
    paymentMethod: "COD",
    address: "Q.1, TP.HCM",
  },
  {
    id: "AGR-ORD-2846",
    customer: "Trần Văn Minh",
    customerAvatar: "https://i.pravatar.cc/100?img=12",
    items: [
      { productId: "p1", productName: "Sầu Riêng Ri6 Đắk Lắk", image: IMG.durian, qty: 3, price: 145000, batchId: "AGR-2026-DL-001" },
      { productId: "p2", productName: "Xoài Cát Hòa Lộc", image: IMG.mango, qty: 2, price: 85000, batchId: "AGR-2026-TG-014" },
    ],
    total: 605000,
    fee: 0,
    net: 605000,
    placedAt: "29/10/2026 11:08",
    status: "packing",
    paymentMethod: "VNPay",
    address: "Q.7, TP.HCM",
  },
  {
    id: "AGR-ORD-2845",
    customer: "Lê Hoàng Phúc",
    customerAvatar: "https://i.pravatar.cc/100?img=15",
    items: [
      { productId: "p1", productName: "Sầu Riêng Ri6 Đắk Lắk", image: IMG.durian, qty: 1, price: 145000, batchId: "AGR-2026-DL-001" },
    ],
    total: 145000,
    fee: 30000,
    net: 115000,
    placedAt: "29/10/2026 09:47",
    status: "delivered",
    paymentMethod: "Momo",
    address: "Thanh Xuân, Hà Nội",
  },
  {
    id: "AGR-ORD-2844",
    customer: "Phạm Thu Hà",
    customerAvatar: "https://i.pravatar.cc/100?img=23",
    items: [
      { productId: "p1", productName: "Sầu Riêng Ri6 Đắk Lắk", image: IMG.durian, qty: 5, price: 145000, batchId: "AGR-2026-DL-001" },
    ],
    total: 725000,
    fee: 0,
    net: 725000,
    placedAt: "28/10/2026 18:32",
    status: "completed",
    paymentMethod: "Banking",
    address: "Hải Châu, Đà Nẵng",
  },
  {
    id: "AGR-ORD-2843",
    customer: "Vũ Đức Anh",
    customerAvatar: "https://i.pravatar.cc/100?img=33",
    items: [
      { productId: "p2", productName: "Xoài Cát Hòa Lộc", image: IMG.mango, qty: 4, price: 85000, batchId: "AGR-2026-TG-014" },
    ],
    total: 340000,
    fee: 0,
    net: 340000,
    placedAt: "28/10/2026 15:11",
    status: "ai_checking",
    paymentMethod: "VNPay",
    address: "Bình Thạnh, TP.HCM",
  },
];

// Doanh thu seller theo ngày (7 ngày)
export const sellerRevenue = [
  { day: "T2", revenue: 1850000, orders: 12 },
  { day: "T3", revenue: 2340000, orders: 15 },
  { day: "T4", revenue: 1980000, orders: 13 },
  { day: "T5", revenue: 3120000, orders: 21 },
  { day: "T6", revenue: 2870000, orders: 18 },
  { day: "T7", revenue: 4250000, orders: 28 },
  { day: "CN", revenue: 5100000, orders: 34 },
];

// Admin dashboard stats
export const adminStats = {
  totalOrders: 1847,
  processingOrders: 234,
  pendingInspection: 18,
  passedBatches: 142,
  rejectedBatches: 7,
  activeComplaints: 12,
  aiAlerts: 3,
  totalRevenue: 284500000,
  todayRevenue: 18500000,
  activeSellers: 864,
  activeBuyers: 12450,
};

// Trung tâm đóng gói - các đơn đang xử lý
export type FulfillmentStage = "received" | "qc" | "packing" | "storage" | "dispatch" | "delivered";

export const fulfillmentStageConfig: Record<FulfillmentStage, { label: string; color: string }> = {
  received: { label: "Đã tiếp nhận", color: "bg-blue-100 text-blue-700" },
  qc: { label: "Kiểm tra chất lượng", color: "bg-purple-100 text-purple-700" },
  packing: { label: "Đang đóng gói", color: "bg-amber-100 text-amber-700" },
  storage: { label: "Đang bảo quản", color: "bg-cyan-100 text-cyan-700" },
  dispatch: { label: "Xuất kho", color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-700" },
};

export const fulfillmentOrders = [
  {
    orderId: "AGR-ORD-2847",
    batchId: "AGR-2026-DL-001",
    receivedAt: "29/10/2026 14:25",
    handler: "Nguyễn Văn An",
    storageTemp: "18°C",
    packingTime: "29/10/2026 15:30",
    dispatchTime: "—",
    status: "packing" as FulfillmentStage,
  },
  {
    orderId: "AGR-ORD-2846",
    batchId: "AGR-2026-DL-001 + AGR-2026-TG-014",
    receivedAt: "29/10/2026 11:10",
    handler: "Trần Thị Bình",
    storageTemp: "15°C",
    packingTime: "—",
    dispatchTime: "—",
    status: "qc" as FulfillmentStage,
  },
  {
    orderId: "AGR-ORD-2845",
    batchId: "AGR-2026-DL-001",
    receivedAt: "29/10/2026 09:50",
    handler: "Lê Văn Cường",
    storageTemp: "18°C",
    packingTime: "29/10/2026 10:15",
    dispatchTime: "29/10/2026 11:00",
    status: "delivered" as FulfillmentStage,
  },
  {
    orderId: "AGR-ORD-2844",
    batchId: "AGR-2026-DL-001",
    receivedAt: "28/10/2026 18:35",
    handler: "Phạm Thị Dung",
    storageTemp: "18°C",
    packingTime: "28/10/2026 19:00",
    dispatchTime: "29/10/2026 08:00",
    status: "delivered" as FulfillmentStage,
  },
];

// Khiếu nại
export type ComplaintStatus = "submitted" | "investigating" | "verifying" | "resolved" | "refunded" | "rejected" | "unknown";

export const complaintStatusConfig: Record<ComplaintStatus, { label: string; color: string }> = {
  submitted: { label: "Đã gửi khiếu nại", color: "bg-blue-100 text-blue-700" },
  investigating: { label: "AgriSmart đang kiểm tra", color: "bg-amber-100 text-amber-700" },
  verifying: { label: "Đang xác minh", color: "bg-purple-100 text-purple-700" },
  resolved: { label: "Đã có kết quả", color: "bg-emerald-100 text-emerald-700" },
  refunded: { label: "Hoàn tiền / đổi hàng", color: "bg-green-100 text-green-700" },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-700" },
  unknown: { label: "Chưa xác định nguyên nhân", color: "bg-gray-100 text-gray-700" },
};

export const complaints = [
  {
    id: "AGR-CPL-128",
    orderId: "AGR-ORD-2845",
    customer: "Lê Hoàng Phúc",
    product: "Sầu Riêng Ri6 Đắk Lắk",
    issue: "Sản phẩm bị hỏng",
    description: "1/3 trái sầu riêng bị dập, cơm chảy nước",
    status: "investigating" as ComplaintStatus,
    submittedAt: "29/10/2026 16:00",
    hasEvidence: true,
  },
  {
    id: "AGR-CPL-127",
    orderId: "AGR-ORD-2840",
    customer: "Đặng Thị Hồng",
    product: "Xoài Cát Hòa Lộc",
    issue: "Sản phẩm không đúng mô tả",
    description: "Xoài chưa chín đủ, vị còn chua",
    status: "verifying" as ComplaintStatus,
    submittedAt: "28/10/2026 20:15",
    hasEvidence: true,
  },
  {
    id: "AGR-CPL-126",
    orderId: "AGR-ORD-2838",
    customer: "Bùi Quang Vinh",
    product: "Cam Sành Hà Giang",
    issue: "Vấn đề giao hàng",
    description: "Giao trễ 6 tiếng, không gọi trước",
    status: "unknown" as ComplaintStatus,
    submittedAt: "28/10/2026 14:30",
    hasEvidence: false,
  },
];

// Quick search tags
export const quickTags = [
  { label: "Sầu Riêng Ri6", keyword: "sầu" },
  { label: "Rau Thủy Canh", keyword: "rau" },
  { label: "Gạo ST25", keyword: "ST25" },
  { label: "Cam Sành", keyword: "cam" },
];

// Farm stories
export const farmStories = [
  {
    id: 1,
    name: "Trang Trại Rau Thủy Canh GreenFarm",
    location: "Đà Lạt, Lâm Đồng",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    description: "Áp dụng công nghệ xơ dừa Hà Lan và hệ thống tưới nhỏ giọt khép kín giúp rau giòn ngọt tự nhiên.",
    metric: "15 loại rau",
  },
  {
    id: 2,
    name: "HTX Bưởi Da Xanh Mỏ Cày",
    location: "Bến Tre",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    description: "30 hộ nông dân liên kết sản xuất bưởi theo tiêu chuẩn GlobalGAP.",
    metric: "50 Hécta",
  },
];

// Customer testimonials
export const testimonials = [
  {
    id: 1,
    name: "Chị Nguyễn Thị Mai",
    role: "Khách hàng thân thiết",
    location: "TP. Hồ Chí Minh",
    avatar: "https://i.pravatar.cc/100?img=44",
    rating: 5,
    content:
      "AgriSmart giao nông sản tươi đến nhà trong 2 tiếng. Tính năng quét QR truy xuất rất yên tâm - biết rõ nông trại nào, thu hoạch ngày nào. AI kiểm tra đơn trước khi giao rất chuyên nghiệp.",
  },
  {
    id: 2,
    name: "Anh Trần Văn Hùng",
    role: "Đầu bếp nhà hàng",
    location: "Hà Nội",
    avatar: "https://i.pravatar.cc/100?img=12",
    rating: 5,
    content:
      "Nhà hàng mình đặt rau củ mỗi ngày qua AgriSmart. Chất lượng ổn định, mỗi lô đều có thông tin kiểm định rõ ràng. Dashboard theo dõi đơn hàng rất tiện.",
  },
  {
    id: 3,
    name: "Cô Lê Thị Bé",
    role: "Nông dân - Thành viên HTX",
    location: "Tiền Giang",
    avatar: "https://i.pravatar.cc/100?img=23",
    rating: 5,
    content:
      "Tham gia AgriSmart, vườn xoài cô bán được rộng hơn. Hệ thống hỗ trợ kiểm tra lô hàng, đóng gói và giao hàng giúp cô yên tâm bán hàng.",
  },
];
