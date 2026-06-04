import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const cats = [
  { name: "Điện thoại - Máy tính bảng", slug: "dien-thoai-may-tinh-bang", icon: "📱" },
  { name: "Điện tử - Điện máy", slug: "dien-tu-dien-may", icon: "📺" },
  { name: "Thời trang nam", slug: "thoi-trang-nam", icon: "👔" },
  { name: "Thời trang nữ", slug: "thoi-trang-nu", icon: "👗" },
  { name: "Nhà cửa - Đời sống", slug: "nha-cua-doi-song", icon: "🏠" },
  { name: "Sách - VPP", slug: "sach-vpp", icon: "📚" },
  { name: "Làm đẹp - Sức khỏe", slug: "lam-dep-suc-khoe", icon: "💄" },
  { name: "Thể thao - Dã ngoại", slug: "the-thao-da-ngoai", icon: "⚽" },
];

function p(
  name: string,
  slug: string,
  desc: string,
  price: number,
  listPrice: number | null,
  rating: number,
  reviewCount: number,
  sold: number,
  badge: string | null,
  catSlug: string,
  brand?: string,
  tags?: string
) {
  return {
    name,
    slug,
    description: desc,
    price,
    listPrice,
    rating,
    reviewCount,
    sold,
    badge,
    categoryId: catSlug,
    brand,
    tags,
  };
}

async function main() {
  // 1. Clean up all tables in reverse dependency order
  console.log("Cleaning up database...");
  await prisma.stockTransferItem.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.inventoryLedger.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.goodsReceiptItem.deleteMany();
  await prisma.goodsReceipt.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.branchProduct.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Default Branches
  console.log("Seeding Branches...");
  const branchD7 = await prisma.branch.create({
    data: { name: "Tiki Shop Quận 7", address: "469 Nguyễn Hữu Thọ, P. Tân Hưng, Quận 7, TP. HCM", phone: "02837718989" }
  });
  const branchGV = await prisma.branch.create({
    data: { name: "Tiki Shop Gò Vấp", address: "242 Nguyễn Văn Lượng, P. 10, Q. Gò Vấp, TP. HCM", phone: "02836222555" }
  });
  const branchDN = await prisma.branch.create({
    data: { name: "Tiki Shop Đà Nẵng", address: "06 Nại Nam, P. Hòa Cường Bắc, Q. Hải Châu, Đà Nẵng", phone: "02363611999" }
  });
  const branches = [branchD7, branchGV, branchDN];

  // 3. Create Default Suppliers
  console.log("Seeding Suppliers...");
  const supVinamilk = await prisma.supplier.create({
    data: { name: "Vinamilk Việt Nam", code: "SUP-VNM", contactName: "Nguyễn Văn A", phone: "02839971111", email: "procurement@vinamilk.com.vn", address: "10 Tân Trào, P. Tân Phú, Quận 7, TP. HCM" }
  });
  const supCoca = await prisma.supplier.create({
    data: { name: "Coca-Cola Việt Nam", code: "SUP-KO", contactName: "Trần Thị B", phone: "02838961000", email: "sales@coca-cola.com.vn", address: "Xa lộ Hà Nội, P. Linh Trung, Q. Thủ Đức, TP. HCM" }
  });
  const supSamsung = await prisma.supplier.create({
    data: { name: "Samsung Vina Electronics", code: "SUP-SSG", contactName: "Lê Hoàng C", phone: "02838217333", email: "partner@samsung.com.vn", address: "Tòa nhà Bitexco, Q. 1, TP. HCM" }
  });
  const supApple = await prisma.supplier.create({
    data: { name: "Apple Vietnam Ltd", code: "SUP-AAPL", contactName: "David Lee", phone: "02838240000", email: "vietnam@apple.com", address: "Tôn Đức Thắng, Q. 1, TP. HCM" }
  });
  const supCoolmate = await prisma.supplier.create({
    data: { name: "Coolmate Fashion", code: "SUP-CLM", contactName: "Phạm Minh D", phone: "1900272737", email: "help@coolmate.me", address: "Đường số 3, KCN Hiệp Phước, Nhà Bè, TP. HCM" }
  });
  const suppliers = [supVinamilk, supCoca, supSamsung, supApple, supCoolmate];

  // 4. Create Categories
  console.log("Seeding Categories...");
  const createdCats: Record<string, string> = {};
  for (const c of cats) {
    const row = await prisma.category.create({ data: c });
    createdCats[c.slug] = row.id;
  }

  // 5. Products list
  const products = [
    p(
      "Điện thoại Samsung Galaxy A54 5G 8GB/128GB",
      "samsung-galaxy-a54-5g",
      "Màn hình Super AMOLED 6.4 inch, chip Exynos 1380, pin 5000mAh.",
      7490000,
      8990000,
      4.8,
      1250,
      3200,
      "-17%",
      "dien-thoai-may-tinh-bang",
      "Samsung",
      "điện thoại,android,5g"
    ),
    p(
      "iPhone 15 128GB | Chính hãng VN/A",
      "iphone-15-128gb",
      "Chip A16 Bionic, Dynamic Island, camera 48MP.",
      19990000,
      22990000,
      4.9,
      890,
      1500,
      "Giảm sốc",
      "dien-thoai-may-tinh-bang",
      "Apple",
      "điện thoại,ios,iphone"
    ),
    p(
      "Xiaomi Redmi Note 13 Pro 8GB/256GB",
      "xiaomi-redmi-note-13-pro",
      "Màn AMOLED 120Hz, Snapdragon 7s Gen 2.",
      6690000,
      7290000,
      4.7,
      560,
      2100,
      null,
      "dien-thoai-may-tinh-bang",
      "Xiaomi",
      "điện thoại,android,redmi"
    ),
    p(
      "Google Pixel 8 Pro 256GB",
      "google-pixel-8-pro",
      "Camera AI tuyệt vời, Tensor G3, màn OLED 6.7\".",
      22490000,
      24990000,
      4.9,
      520,
      1200,
      "Mới",
      "dien-thoai-may-tinh-bang",
      "Google",
      "điện thoại,android,pixel"
    ),
    p(
      "OnePlus 12 12GB/256GB",
      "oneplus-12",
      "Snapdragon 8 Gen 3, sạc nhanh 100W.",
      18990000,
      21990000,
      4.7,
      350,
      890,
      null,
      "dien-thoai-may-tinh-bang",
      "OnePlus",
      "điện thoại,android,flagship"
    ),
    p(
      "iPad Pro 11 inch M4 256GB",
      "ipad-pro-11-inch-m4",
      "Chip M4, màn OLED mini-LED, Apple Pencil hỗ trợ.",
      21990000,
      24990000,
      4.8,
      680,
      2100,
      "-12%",
      "dien-thoai-may-tinh-bang",
      "Apple",
      "máy tính bảng,ipad"
    ),
    p(
      "Samsung Galaxy Tab S9 11 inch",
      "samsung-galaxy-tab-s9",
      "Snapdragon 8 Gen 2, màn AMOLED 90Hz.",
      14990000,
      17990000,
      4.6,
      420,
      1600,
      null,
      "dien-thoai-may-tinh-bang",
      "Samsung",
      "máy tính bảng,tablet"
    ),
    p(
      "Laptop ASUS VivoBook 15 OLED",
      "laptop-asus-vivobook-15-oled",
      "Intel Core i5, RAM 16GB, SSD 512GB, OLED.",
      15990000,
      17990000,
      4.6,
      320,
      890,
      "Mới",
      "dien-tu-dien-may",
      "ASUS",
      "laptop,máy tính,oled"
    ),
    p(
      "MacBook Pro 14 inch M3 Pro",
      "macbook-pro-14-m3-pro",
      "Chip M3 Pro, 18GB RAM, 512GB SSD.",
      34990000,
      39990000,
      4.9,
      450,
      800,
      "Bán chạy",
      "dien-tu-dien-may",
      "Apple",
      "laptop,macbook,pro"
    ),
    p(
      "Dell XPS 15 i7 RTX 4070",
      "dell-xps-15-i7-rtx",
      "Màn OLED 3.5K, GPU RTX 4070, thiết kế cao cấp.",
      32990000,
      36990000,
      4.8,
      280,
      650,
      null,
      "dien-tu-dien-may",
      "Dell",
      "laptop,gaming,xps"
    ),
    p(
      "Tai nghe Bluetooth Sony WH-1000XM5",
      "sony-wh-1000xm5",
      "Chống ồn chủ động, pin 30 giờ.",
      7490000,
      8990000,
      4.9,
      2100,
      5600,
      "TikiNOW",
      "dien-tu-dien-may",
      "Sony",
      "tai nghe,bluetooth,chống ồn"
    ),
    p(
      "AirPods Pro Gen 2",
      "airpods-pro-gen-2",
      "Chống ồn chủ động, âm thanh không gian.",
      4990000,
      5490000,
      4.9,
      1800,
      4200,
      "Giảm sốc",
      "dien-tu-dien-may",
      "Apple",
      "tai nghe,airpods,wireless"
    ),
    p(
      "Smart TV Samsung 55 inch Crystal UHD",
      "smart-tv-samsung-55",
      "4K HDR, hệ điều hành Tizen.",
      11290000,
      13990000,
      4.5,
      412,
      780,
      "-19%",
      "dien-tu-dien-may"
    ),
    p(
      "Smart TV LG 65 inch OLED evo",
      "smart-tv-lg-65-oled",
      "OLED 4K 120Hz, AI ThinQ.",
      22990000,
      26990000,
      4.9,
      580,
      1200,
      "Hàng hiệu",
      "dien-tu-dien-may",
      "LG",
      "tv,oled,4k"
    ),
    p(
      "Tủ lạnh Sharp 280L Inverter",
      "tu-lanh-sharp-280l",
      "Tiết kiệm điện, bảo quản tươi lâu.",
      6990000,
      8490000,
      4.7,
      320,
      2100,
      null,
      "dien-tu-dien-may",
      "Sharp",
      "tủ lạnh,điện tử"
    ),
    p(
      "Máy giặt LG 8kg AI DD",
      "may-giat-lg-8kg",
      "Công nghệ AI DD, tiết kiệm nước.",
      8990000,
      10490000,
      4.8,
      450,
      1800,
      "Bán chạy",
      "dien-tu-dien-may",
      "LG",
      "máy giặt,điện gia dụng"
    ),
    p(
      "Áo thun nam cổ trụ Basic Coolmate",
      "ao-thun-nam-co-tru-coolmate",
      "Vải cotton thoáng mát, nhiều màu.",
      199000,
      299000,
      4.7,
      890,
      12000,
      null,
      "thoi-trang-nam"
    ),
    p(
      "Quần jean nam slim fit",
      "quan-jean-nam-slim-fit",
      "Co giãn nhẹ, form slim.",
      399000,
      599000,
      4.4,
      230,
      3400,
      null,
      "thoi-trang-nam"
    ),
    p(
      "Áo sơ mi nam oxford trắng",
      "ao-so-mi-nam-oxford",
      "Chất vải oxford cao cấp, form chuẩn.",
      549000,
      799000,
      4.6,
      310,
      2100,
      null,
      "thoi-trang-nam",
      "Levi's",
      "áo sơ mi,nam,oxford"
    ),
    p(
      "Quần short nam thể thao",
      "quan-short-nam-the-thao",
      "Vải polyester nhanh khô, thoáng mát.",
      279000,
      399000,
      4.5,
      180,
      1500,
      null,
      "thoi-trang-nam"
    ),
    p(
      "Áo khoác jean nam xanh đen",
      "ao-khoac-jean-nam-xanh",
      "Kinh điển, form Oversize.",
      679000,
      999000,
      4.7,
      520,
      3200,
      "Mới",
      "thoi-trang-nam"
    ),
    p(
      "Váy liền nữ công sở",
      "vay-lien-nu-cong-so",
      "Chất liệu lụa mát, thanh lịch.",
      459000,
      659000,
      4.6,
      156,
      2100,
      "Mới",
      "thoi-trang-nu"
    ),
    p(
      "Túi xách nữ da PU cao cấp",
      "tui-xach-nu-da-pu",
      "Nhiều ngăn, khóa kéo YKK.",
      329000,
      499000,
      4.5,
      98,
      890,
      null,
      "thoi-trang-nu"
    ),
    p(
      "Quần legging nữ tập yoga",
      "quan-legging-nu-yoga",
      "Co giãn 4 chiều, thoáng mát.",
      349000,
      499000,
      4.8,
      420,
      4500,
      null,
      "thoi-trang-nu",
      "Lululemon",
      "quần,yoga,nữ"
    ),
    p(
      "Áo camisole nữ thun cotton",
      "ao-camisole-nu-cotton",
      "Mềm mại, nhiều màu sắc.",
      129000,
      199000,
      4.6,
      280,
      3100,
      null,
      "thoi-trang-nu"
    ),
    p(
      "Áo blazer nữ công sở",
      "ao-blazer-nu-cong-so",
      "Vải lỏng, dáng thanh lịch.",
      799000,
      1099000,
      4.7,
      210,
      1800,
      "Bán chạy",
      "thoi-trang-nu"
    ),
    p(
      "Nồi chiên không dầu Philips 4.1L",
      "noi-chien-khong-dau-philips",
      "Công nghệ Rapid Air, dễ vệ sinh.",
      1990000,
      2490000,
      4.8,
      3400,
      15000,
      "Bán chạy",
      "nha-cua-doi-song"
    ),
    p(
      "Bộ chăn ga cotton Amando",
      "bo-chan-ga-cotton-amando",
      "1m6 x 2m, nhiều họa tiết.",
      890000,
      1190000,
      4.6,
      670,
      4500,
      null,
      "nha-cua-doi-song"
    ),
    p(
      "Sách Đắc Nhân Tâm (bìa cứng)",
      "sach-dac-nhan-tam",
      "Bản dịch Nguyễn Hiến Lê.",
      79000,
      120000,
      4.9,
      12000,
      80000,
      null,
      "sach-vpp"
    ),
    p(
      "Bút bi Thiên Long TL-027",
      "but-bi-thien-long-tl027",
      "Hộp 20 cây, mực xanh.",
      45000,
      null,
      4.5,
      560,
      23000,
      null,
      "sach-vpp"
    ),
    p(
      "Serum Vitamin C The Ordinary",
      "serum-vitamin-c-the-ordinary",
      "Làm sáng da, 30ml.",
      320000,
      420000,
      4.7,
      2100,
      12000,
      "-24%",
      "lam-dep-suc-khoe"
    ),
    p(
      "Kem chống nắng La Roche-Posay",
      "kem-chong-nang-la-roche-posay",
      "SPF 50+, không nhờn.",
      395000,
      495000,
      4.8,
      5600,
      18000,
      "Hàng hiệu",
      "lam-dep-suc-khoe"
    ),
    p(
      "Giày chạy bộ Nike Revolution 6",
      "giay-chay-bo-nike-revolution-6",
      "Đệm êm, size đủ.",
      1890000,
      2290000,
      4.6,
      890,
      5600,
      null,
      "the-thao-da-ngoai"
    ),
    p(
      "Lều cắm trại 4 người Naturehike",
      "leu-cam-trai-4-nguoi",
      "Chống nước, gọn nhẹ.",
      2490000,
      2990000,
      4.5,
      230,
      890,
      null,
      "the-thao-da-ngoai"
    ),
    p(
      "Giày thể thao Adidas Ultraboost",
      "giay-adidas-ultraboost",
      "Công nghệ Boost, thoáng khí.",
      2390000,
      2890000,
      4.8,
      650,
      3200,
      null,
      "the-thao-da-ngoai",
      "Adidas",
      "giày,thể thao,adidas"
    ),
    p(
      "Balo đa năng Osprey 50L",
      "balo-osprey-50l",
      "Thiết kế ergonomic, chống nước.",
      1890000,
      2290000,
      4.7,
      240,
      680,
      "Mới",
      "the-thao-da-ngoai",
      "Osprey",
      "balo,du lịch"
    ),
    p(
      "Mũ lưỡi trai snapback",
      "mu-luoi-trai-snapback",
      "Cotton 100%, khóa snapback.",
      189000,
      289000,
      4.5,
      320,
      1200,
      null,
      "thoi-trang-nam"
    ),
    p(
      "Dép tổ ong nam EVA",
      "dep-to-ong-nam-eva",
      "Nhẹ, thoáng mát, bền lâu.",
      99000,
      149000,
      4.6,
      450,
      6700,
      null,
      "thoi-trang-nam"
    ),
    p(
      "Áo tank top nữ thế thao",
      "ao-tank-top-nu-the-thao",
      "Vải mesh thông thoáng, co giãn.",
      149000,
      229000,
      4.7,
      380,
      2900,
      null,
      "thoi-trang-nu"
    ),
    p(
      "Khăn quàng cổ lụa cao cấp",
      "khan-quang-co-lua",
      "100% lụa tơ tằm, size 90x90cm.",
      259000,
      399000,
      4.8,
      210,
      980,
      "Hàng hiệu",
      "thoi-trang-nu"
    ),
    p(
      "Giày bata nữ công sở",
      "giay-bata-nu-cong-so",
      "Da thật, gót 5cm, thoáng chân.",
      589000,
      899000,
      4.6,
      180,
      1500,
      null,
      "thoi-trang-nu"
    ),
    p(
      "Khung treo ảnh gỗ 3D",
      "khung-treo-anh-go-3d",
      "Gỗ tự nhiên, kiểu hiện đại.",
      269000,
      399000,
      4.7,
      320,
      2100,
      null,
      "nha-cua-doi-song"
    ),
    p(
      "Thảm trải sàn cotton tự nhiên",
      "tham-trai-san-cotton",
      "100% cotton, kích thước 60x90cm.",
      189000,
      299000,
      4.5,
      280,
      1800,
      null,
      "nha-cua-doi-song"
    ),
    p(
      "Bàn làm việc gấp gọn",
      "ban-lam-viec-gap-gon",
      "Chất liệu MDF, chịu lực tốt.",
      1290000,
      1690000,
      4.6,
      150,
      780,
      null,
      "nha-cua-doi-song"
    ),
    p(
      "Ghế văn phòng lưng cao",
      "ghe-van-phong-lung-cao",
      "Chỉnh chiều cao, tựa lưng thoáng.",
      2190000,
      2890000,
      4.7,
      420,
      2300,
      "Bán chạy",
      "nha-cua-doi-song"
    ),
    p(
      "Bộ quầy phòng bếp inox 3 tầng",
      "bo-quay-phong-bep-inox",
      "Inox 304, dễ vệ sinh.",
      1890000,
      2490000,
      4.8,
      230,
      1200,
      null,
      "nha-cua-doi-song"
    ),
    p(
      "Vở ngoại ngữ Tập 200 trang",
      "vo-ngoai-ngu-tap-200",
      "Giấy mỏng, lề đỏ.",
      15000,
      25000,
      4.7,
      890,
      18000,
      null,
      "sach-vpp"
    ),
    p(
      "Sách Harry Potter Tập 1",
      "sach-harry-potter-tap-1",
      "Bản dịch Nguyễn Ân Hệ, bìa cứng.",
      89000,
      129000,
      4.9,
      4200,
      32000,
      "Bán chạy",
      "sach-vpp"
    ),
    p(
      "Bộ màu vẽ Faber-Castell 36 màu",
      "bo-mau-ve-faber-castell-36",
      "Chất lượng cao, sắc vía rực rỡ.",
      129000,
      189000,
      4.8,
      520,
      3200,
      null,
      "sach-vpp",
      "Faber-Castell",
      "màu vẽ,mỹ phẩm"
    ),
    p(
      "Máy tính Casio phù hợp học tập",
      "may-tinh-casio-hoc-tap",
      "Màn hình LCD, 582 hàm toán.",
      189000,
      249000,
      4.7,
      410,
      2800,
      null,
      "sach-vpp"
    ),
    p(
      "Nước hoa Nữ Frangipani Mademoiselle",
      "nuoc-hoa-nu-frangipani",
      "Hương hoa, nước hoa ngoại 50ml.",
      249000,
      349000,
      4.8,
      780,
      4200,
      "Hàng hiệu",
      "lam-dep-suc-khoe"
    ),
    p(
      "Dầu gội đầu Camellia Pro Care",
      "dau-goi-dau-camellia",
      "Với tinh dầu lưu ly, 400ml.",
      89000,
      129000,
      4.6,
      520,
      3100,
      null,
      "lam-dep-suc-khoe"
    ),
    p(
      "Mặt nạ dây mỏng Mediheal",
      "mat-na-day-mong-mediheal",
      "Mặt nạ Mask, hộp 10 miếng.",
      179000,
      239000,
      4.9,
      1200,
      6800,
      "Bán chạy",
      "lam-dep-suc-khoe"
    ),
    p(
      "Kem dưỡng tay Eucerin Advanced",
      "kem-duong-tay-eucerin",
      "Dưỡng ẩm, mềm mại, 75ml.",
      119000,
      159000,
      4.7,
      310,
      1900,
      null,
      "lam-dep-suc-khoe"
    ),
    p(
      "Bộ chăm sóc da Cetaphil 5 sản phẩm",
      "bo-cham-soc-da-cetaphil",
      "Dành cho da nhạy cảm.",
      489000,
      659000,
      4.8,
      420,
      2100,
      null,
      "lam-dep-suc-khoe"
    ),
  ];

  const imageUrls: Record<string, string> = {
    "samsung-galaxy-a54-5g": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=280&h=280&fit=crop",
    "iphone-15-128gb": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=280&h=280&fit=crop",
    "xiaomi-redmi-note-13-pro": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=280&h=280&fit=crop",
    "google-pixel-8-pro": "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=280&h=280&fit=crop",
    "oneplus-12": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=280&h=280&fit=crop",
    "ipad-pro-11-inch-m4": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=280&h=280&fit=crop",
    "samsung-galaxy-tab-s9": "https://images.unsplash.com/photo-1589739900243-4b52cd9dd9a0?w=280&h=280&fit=crop",
    "laptop-asus-vivobook-15-oled": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=280&h=280&fit=crop",
    "macbook-pro-14-m3-pro": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=280&h=280&fit=crop",
    "dell-xps-15-i7-rtx": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=280&h=280&fit=crop",
    "sony-wh-1000xm5": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=280&h=280&fit=crop",
    "airpods-pro-gen-2": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=280&h=280&fit=crop",
    "smart-tv-samsung-55": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=280&h=280&fit=crop",
    "smart-tv-lg-65-oled": "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=280&h=280&fit=crop",
    "tu-lanh-sharp-280l": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=280&h=280&fit=crop",
    "may-giat-lg-8kg": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=280&h=280&fit=crop",
    "ao-thun-nam-co-tru-coolmate": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=280&h=280&fit=crop",
    "quan-jean-nam-slim-fit": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=280&h=280&fit=crop",
    "ao-so-mi-nam-oxford": "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=280&h=280&fit=crop",
    "quan-short-nam-the-thao": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=280&h=280&fit=crop",
    "ao-khoac-jean-nam-xanh": "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=280&h=280&fit=crop",
    "mu-luoi-trai-snapback": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=280&h=280&fit=crop",
    "dep-to-ong-nam-eva": "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=280&h=280&fit=crop",
    "vay-lien-nu-cong-so": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=280&h=280&fit=crop",
    "tui-xach-nu-da-pu": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=280&h=280&fit=crop",
    "quan-legging-nu-yoga": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=280&h=280&fit=crop",
    "ao-camisole-nu-cotton": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=280&h=280&fit=crop",
    "ao-blazer-nu-cong-so": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=280&h=280&fit=crop",
    "ao-tank-top-nu-the-thao": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=280&h=280&fit=crop",
    "khan-quang-co-lua": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=280&h=280&fit=crop",
    "giay-bata-nu-cong-so": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=280&h=280&fit=crop",
    "noi-chien-khong-dau-philips": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=280&h=280&fit=crop",
    "bo-chan-ga-cotton-amando": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=280&h=280&fit=crop",
    "khung-treo-anh-go-3d": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=280&h=280&fit=crop",
    "tham-trai-san-cotton": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=280&h=280&fit=crop",
    "ban-lam-viec-gap-gon": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=280&h=280&fit=crop",
    "ghe-van-phong-lung-cao": "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=280&h=280&fit=crop",
    "bo-quay-phong-bep-inox": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=280&h=280&fit=crop",
    "sach-dac-nhan-tam": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=280&h=280&fit=crop",
    "but-bi-thien-long-tl027": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=280&h=280&fit=crop",
    "vo-ngoai-ngu-tap-200": "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=280&h=280&fit=crop",
    "sach-harry-potter-tap-1": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=280&h=280&fit=crop",
    "bo-mau-ve-faber-castell-36": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=280&h=280&fit=crop",
    "may-tinh-casio-hoc-tap": "https://images.unsplash.com/photo-1565372910027-5a0e7f0c7b43?w=280&h=280&fit=crop",
    "serum-vitamin-c-the-ordinary": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=280&h=280&fit=crop",
    "kem-chong-nang-la-roche-posay": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=280&h=280&fit=crop",
    "nuoc-hoa-nu-frangipani": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=280&h=280&fit=crop",
    "dau-goi-dau-camellia": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=280&h=280&fit=crop",
    "mat-na-day-mong-mediheal": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=280&h=280&fit=crop",
    "kem-duong-tay-eucerin": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=280&h=280&fit=crop",
    "bo-cham-soc-da-cetaphil": "https://images.unsplash.com/photo-1556228578-dd6c2de4d2f9?w=280&h=280&fit=crop",
    "giay-chay-bo-nike-revolution-6": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=280&h=280&fit=crop",
    "leu-cam-trai-4-nguoi": "https://images.unsplash.com/photo-1504280390368-3971d6b8d4c1?w=280&h=280&fit=crop",
    "giay-adidas-ultraboost": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=280&h=280&fit=crop",
    "balo-osprey-50l": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=280&h=280&fit=crop",
  };

  // 6. Create Products, link Branch Products with 0 stock
  console.log("Seeding Products and Branch Products (Init 0)...");
  const createdProducts: Array<{ id: string; name: string; sku: string; brand: string | null }> = [];
  for (const x of products) {
    const cid = createdCats[x.categoryId];
    const imageUrl = imageUrls[x.slug] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=280&h=280&fit=crop`;
    
    // Generate SKU & Barcode based on product properties
    const sku = `SKU-${x.slug.toUpperCase()}`;
    const barcode = `893000${Math.floor(100000 + Math.random() * 900000)}`;

    const pRow = await prisma.product.create({
      data: {
        name: x.name,
        slug: x.slug,
        sku,
        barcode,
        description: x.description,
        price: x.price,
        listPrice: x.listPrice,
        image: imageUrl,
        rating: x.rating,
        reviewCount: x.reviewCount,
        sold: x.sold,
        badge: x.badge,
        brand: x.brand ?? null,
        tags: x.tags ?? null,
        categoryId: cid,
      },
    });

    createdProducts.push({ id: pRow.id, name: pRow.name, sku: pRow.sku!, brand: pRow.brand });

    // Enforce: Initialize stock for all branches at exactly 0
    for (const br of branches) {
      await prisma.branchProduct.create({
        data: {
          branchId: br.id,
          productId: pRow.id,
          stock: 0,
          minStock: 10,
        }
      });
    }
  }

  // 7. Seed one Sample Purchase Order and Goods Receipt to generate audit history and non-zero stock
  console.log("Seeding Sample Purchase Order & Goods Receipt (Audit Trail)...");
  // Let's procure "iPhone 15 128GB" and "Sách Đắc Nhân Tâm (bìa cứng)" from Apple and Vinamilk suppliers
  const pIphone = createdProducts.find(item => item.name.includes("iPhone 15"));
  const pSach = createdProducts.find(item => item.name.includes("Đắc Nhân Tâm"));

  if (pIphone && pSach) {
    // PO 1: procuring iPhones from Apple VN
    const po1 = await prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2026-0001",
        supplierId: supApple.id,
        status: "COMPLETED", // Transitioned directly to completed for seeding
        approvedAt: new Date(),
        approvedById: "seed-process",
        items: {
          create: [
            { productId: pIphone.id, quantityOrdered: 50, pricePerUnit: 18000000 }
          ]
        }
      }
    });

    // Goods Receipt for PO 1
    const gr1 = await prisma.goodsReceipt.create({
      data: {
        grNumber: "GR-2026-0001",
        purchaseOrderId: po1.id,
        branchId: branchD7.id,
        receivedById: "seed-process",
        receivedDate: new Date(),
        items: {
          create: [
            { productId: pIphone.id, qtyReceived: 50, qtyDamaged: 0 }
          ]
        }
      },
      include: { items: true }
    });

    // Create Batch & Ledger entries for gr1 (Branch Quận 7)
    const gr1Item = gr1.items[0];
    const batch1 = await prisma.inventoryBatch.create({
      data: {
        batchNumber: "BAT-IP15-001",
        goodsReceiptItemId: gr1Item.id,
        productId: pIphone.id,
        supplierId: supApple.id,
        branchId: branchD7.id,
        mfgDate: new Date("2026-01-01"),
        expiryDate: new Date("2028-01-01"),
        initialQty: 50,
        remainingQty: 50
      }
    });

    // Write Ledger
    await prisma.inventoryLedger.create({
      data: {
        productId: pIphone.id,
        branchId: branchD7.id,
        batchId: batch1.id,
        movementType: "PURCHASE_RECEIPT",
        qtyChange: 50,
        balanceAfter: 50,
        sourceDocId: gr1.id
      }
    });

    // Update BranchProduct Stock
    await prisma.branchProduct.update({
      where: {
        branchId_productId: {
          branchId: branchD7.id,
          productId: pIphone.id
        }
      },
      data: { stock: 50 }
    });

    // PO 2: procuring books from Vinamilk (mocking supplier connection for demo purposes)
    const po2 = await prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2026-0002",
        supplierId: supVinamilk.id,
        status: "COMPLETED",
        approvedAt: new Date(),
        approvedById: "seed-process",
        items: {
          create: [
            { productId: pSach.id, quantityOrdered: 200, pricePerUnit: 50000 }
          ]
        }
      }
    });

    const gr2 = await prisma.goodsReceipt.create({
      data: {
        grNumber: "GR-2026-0002",
        purchaseOrderId: po2.id,
        branchId: branchGV.id,
        receivedById: "seed-process",
        receivedDate: new Date(),
        items: {
          create: [
            { productId: pSach.id, qtyReceived: 200, qtyDamaged: 0 }
          ]
        }
      },
      include: { items: true }
    });

    const gr2Item = gr2.items[0];
    // Batch for Books (Tiki Shop Gò Vấp)
    const batch2 = await prisma.inventoryBatch.create({
      data: {
        batchNumber: "BAT-DNT-001",
        goodsReceiptItemId: gr2Item.id,
        productId: pSach.id,
        supplierId: supVinamilk.id,
        branchId: branchGV.id,
        mfgDate: new Date("2026-05-01"),
        expiryDate: new Date("2027-05-01"),
        initialQty: 200,
        remainingQty: 200
      }
    });

    await prisma.inventoryLedger.create({
      data: {
        productId: pSach.id,
        branchId: branchGV.id,
        batchId: batch2.id,
        movementType: "PURCHASE_RECEIPT",
        qtyChange: 200,
        balanceAfter: 200,
        sourceDocId: gr2.id
      }
    });

    await prisma.branchProduct.update({
      where: {
        branchId_productId: {
          branchId: branchGV.id,
          productId: pSach.id
        }
      },
      data: { stock: 200 }
    });
  }

  // 8. Create Admin and Store Manager Users
  console.log("Seeding Users...");
  const adminEmail = "admin@demo.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "admin123";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", name: "Quản trị viên", password: adminHash },
    create: {
      email: adminEmail,
      name: "Quản trị viên",
      password: adminHash,
      role: "ADMIN",
      phone: null,
    },
  });

  const auditorEmail = "auditor@demo.local";
  const auditorHash = await bcrypt.hash("auditor123", 10);
  await prisma.user.upsert({
    where: { email: auditorEmail },
    update: { role: "AUDITOR", name: "Kiểm toán viên kho", password: auditorHash },
    create: {
      email: auditorEmail,
      name: "Kiểm toán viên kho",
      password: auditorHash,
      role: "AUDITOR",
      phone: null,
    },
  });

  console.log("Seed OK!");
  console.log("Suppliers: ", suppliers.length);
  console.log("Branches: ", branches.length);
  console.log("Categories: ", cats.length);
  console.log("Products: ", products.length);
  console.log("Admin: ", adminEmail, " (pwd: ", adminPassword, ")");
  console.log("Auditor: ", auditorEmail, " (pwd: auditor123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
