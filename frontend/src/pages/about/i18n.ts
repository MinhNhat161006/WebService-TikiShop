/* =========================================================
   About Page — i18n content for VI / EN / JA
   ========================================================= */

export type Locale = "vi" | "en" | "ja";

export interface AboutContent {
  nav: { home: string; about: string };
  hero: {
    headline: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  whoWeAre: {
    title: string;
    p1: string;
    p2: string;
  };
  mission: {
    title: string;
    items: string[];
  };
  values: {
    title: string;
    items: { icon: string; label: string; desc: string }[];
  };
  metrics: {
    title: string;
    items: { value: string; label: string }[];
  };
  whyShop: {
    title: string;
    subtitle: string;
    items: { icon: string; title: string; desc: string }[];
  };
  tech: {
    title: string;
    subtitle: string;
    items: string[];
  };
  cta: {
    title: string;
    subtitle: string;
    btn1: string;
    btn2: string;
  };
  langLabel: string;
}

const vi: AboutContent = {
  nav: { home: "Trang chủ", about: "Giới thiệu" },
  hero: {
    headline: "Mua sắm thông minh — Giao nhanh mọi nơi",
    subtitle:
      "Nền tảng thương mại điện tử hàng đầu với hàng triệu sản phẩm chính hãng, giao hàng nhanh 2h và trải nghiệm mua sắm hiện đại.",
    cta1: "Mua sắm ngay",
    cta2: "Khám phá danh mục",
  },
  whoWeAre: {
    title: "Chúng tôi là ai?",
    p1: "Chúng tôi là nền tảng thương mại điện tử kết nối hàng triệu người mua với hàng nghìn thương hiệu và nhà bán hàng uy tín. Từ điện tử, thời trang, gia dụng đến sách và thực phẩm — tất cả đều có trên một nền tảng duy nhất.",
    p2: "Với công nghệ hiện đại và hệ thống logistics mạnh mẽ, chúng tôi cam kết mang đến trải nghiệm mua sắm nhanh chóng, tiện lợi và đáng tin cậy cho mọi khách hàng tại Việt Nam.",
  },
  mission: {
    title: "Sứ mệnh của chúng tôi",
    items: [
      "Đưa mua sắm online trở nên đơn giản và thông minh hơn cho mọi người.",
      "Kết nối khách hàng với sản phẩm chất lượng từ các thương hiệu uy tín.",
      "Liên tục cải thiện trải nghiệm mua sắm kỹ thuật số.",
      "Cung cấp dịch vụ giao hàng nhanh, đáng tin cậy trên toàn quốc.",
    ],
  },
  values: {
    title: "Giá trị cốt lõi",
    items: [
      { icon: "🛡️", label: "Uy tín", desc: "Sản phẩm chính hãng, minh bạch và đáng tin cậy." },
      { icon: "⚡", label: "Tiện lợi", desc: "Mua sắm mọi lúc, giao hàng nhanh chóng." },
      { icon: "👤", label: "Khách hàng là trung tâm", desc: "Luôn lắng nghe và phục vụ tốt nhất." },
      { icon: "🔬", label: "Đổi mới", desc: "Ứng dụng công nghệ để nâng cao trải nghiệm." },
      { icon: "💰", label: "Giá tốt", desc: "Cam kết giá cạnh tranh và khuyến mãi hấp dẫn." },
      { icon: "✅", label: "Chất lượng dịch vụ", desc: "Hỗ trợ tận tình, đổi trả dễ dàng." },
    ],
  },
  metrics: {
    title: "Nền tảng đáng tin cậy",
    items: [
      { value: "10M+", label: "Sản phẩm" },
      { value: "50K+", label: "Nhà bán hàng" },
      { value: "20M+", label: "Khách hàng" },
      { value: "63", label: "Tỉnh thành phục vụ" },
      { value: "2h", label: "Giao nhanh nội thành" },
      { value: "365", label: "Ngày hoạt động/năm" },
    ],
  },
  whyShop: {
    title: "Tại sao chọn chúng tôi?",
    subtitle: "Trải nghiệm mua sắm vượt trội",
    items: [
      { icon: "🚚", title: "Giao hàng nhanh", desc: "Giao nhanh 2h nội thành, toàn quốc từ 1-3 ngày." },
      { icon: "💲", title: "Giá cạnh tranh", desc: "Cam kết giá tốt, nhiều chương trình khuyến mãi." },
      { icon: "🏪", title: "Nhà bán uy tín", desc: "Hàng nghìn thương hiệu và shop đã xác thực." },
      { icon: "🤖", title: "Gợi ý thông minh", desc: "AI cá nhân hóa đề xuất sản phẩm phù hợp." },
      { icon: "🔒", title: "Thanh toán an toàn", desc: "Nhiều hình thức thanh toán bảo mật cao." },
      { icon: "↩️", title: "Đổi trả dễ dàng", desc: "Chính sách đổi trả linh hoạt, hoàn tiền nhanh." },
    ],
  },
  tech: {
    title: "Công nghệ & Trải nghiệm",
    subtitle: "Nền tảng được xây dựng trên công nghệ hiện đại",
    items: [
      "Quy trình mua sắm tối ưu, nhanh gọn từ tìm kiếm đến thanh toán",
      "Gợi ý sản phẩm thông minh dựa trên lịch sử và sở thích",
      "Trải nghiệm mượt mà trên cả desktop và mobile",
      "Hệ thống bảo mật cao, ổn định 24/7",
      "Tìm kiếm nâng cao với bộ lọc thông minh",
    ],
  },
  cta: {
    title: "Sẵn sàng trải nghiệm?",
    subtitle: "Hàng triệu sản phẩm đang chờ bạn. Bắt đầu mua sắm thông minh ngay hôm nay.",
    btn1: "Mua sắm ngay",
    btn2: "Liên hệ hỗ trợ",
  },
  langLabel: "Ngôn ngữ",
};

const en: AboutContent = {
  nav: { home: "Home", about: "About" },
  hero: {
    headline: "Smart Shopping — Fast Delivery Everywhere",
    subtitle:
      "A leading e-commerce platform with millions of authentic products, 2-hour delivery, and a modern shopping experience.",
    cta1: "Shop Now",
    cta2: "Browse Categories",
  },
  whoWeAre: {
    title: "Who We Are",
    p1: "We are an e-commerce platform connecting millions of buyers with thousands of trusted brands and sellers. From electronics, fashion, home goods to books and groceries — everything on a single platform.",
    p2: "With cutting-edge technology and a robust logistics network, we are committed to delivering a fast, convenient, and trustworthy shopping experience for every customer.",
  },
  mission: {
    title: "Our Mission",
    items: [
      "Make online shopping simpler and smarter for everyone.",
      "Connect customers with quality products from trusted brands.",
      "Continuously improve the digital shopping experience.",
      "Provide fast and reliable delivery nationwide.",
    ],
  },
  values: {
    title: "Core Values",
    items: [
      { icon: "🛡️", label: "Trust", desc: "Authentic products, transparent and reliable." },
      { icon: "⚡", label: "Convenience", desc: "Shop anytime with fast delivery." },
      { icon: "👤", label: "Customer First", desc: "Always listening and serving our best." },
      { icon: "🔬", label: "Innovation", desc: "Applying technology to enhance experience." },
      { icon: "💰", label: "Affordability", desc: "Competitive pricing with great deals." },
      { icon: "✅", label: "Quality Service", desc: "Dedicated support, easy returns." },
    ],
  },
  metrics: {
    title: "A Platform You Can Trust",
    items: [
      { value: "10M+", label: "Products" },
      { value: "50K+", label: "Sellers" },
      { value: "20M+", label: "Customers" },
      { value: "63", label: "Provinces Served" },
      { value: "2h", label: "Express Delivery" },
      { value: "365", label: "Days/Year Active" },
    ],
  },
  whyShop: {
    title: "Why Shop With Us?",
    subtitle: "A superior shopping experience",
    items: [
      { icon: "🚚", title: "Fast Delivery", desc: "2-hour express in cities, 1-3 days nationwide." },
      { icon: "💲", title: "Competitive Pricing", desc: "Best prices with frequent promotions." },
      { icon: "🏪", title: "Trusted Sellers", desc: "Thousands of verified brands and shops." },
      { icon: "🤖", title: "Smart Recommendations", desc: "AI-powered personalized product suggestions." },
      { icon: "🔒", title: "Secure Payments", desc: "Multiple secure payment methods." },
      { icon: "↩️", title: "Easy Returns", desc: "Flexible return policy, fast refunds." },
    ],
  },
  tech: {
    title: "Technology & Experience",
    subtitle: "Built on modern technology",
    items: [
      "Optimized shopping flow from search to checkout",
      "Smart product recommendations based on your preferences",
      "Seamless experience on desktop and mobile",
      "Highly secure and stable 24/7 system",
      "Advanced search with intelligent filters",
    ],
  },
  cta: {
    title: "Ready to Get Started?",
    subtitle: "Millions of products await. Start smart shopping today.",
    btn1: "Shop Now",
    btn2: "Contact Support",
  },
  langLabel: "Language",
};

const ja: AboutContent = {
  nav: { home: "ホーム", about: "会社概要" },
  hero: {
    headline: "スマートショッピング — 全国迅速配送",
    subtitle:
      "数百万の正規品を取り揃え、2時間配送と最新のショッピング体験を提供するECプラットフォーム。",
    cta1: "今すぐ購入",
    cta2: "カテゴリーを見る",
  },
  whoWeAre: {
    title: "私たちについて",
    p1: "私たちは数百万の購入者と数千の信頼できるブランド・販売者をつなぐECプラットフォームです。電子機器、ファッション、生活用品から書籍、食品まで、すべてが一つのプラットフォームに。",
    p2: "最先端のテクノロジーと強力な物流ネットワークにより、すべてのお客様に迅速で便利かつ信頼できるショッピング体験をお届けします。",
  },
  mission: {
    title: "私たちの使命",
    items: [
      "すべての人にとってオンラインショッピングをより簡単でスマートに。",
      "信頼できるブランドの高品質な商品とお客様をつなぐ。",
      "デジタルショッピング体験を継続的に改善する。",
      "全国に迅速で信頼できる配送を提供する。",
    ],
  },
  values: {
    title: "コアバリュー",
    items: [
      { icon: "🛡️", label: "信頼", desc: "正規品、透明性、信頼性。" },
      { icon: "⚡", label: "利便性", desc: "いつでもお買い物、迅速配送。" },
      { icon: "👤", label: "顧客第一", desc: "常にお客様の声に耳を傾け、最善を尽くします。" },
      { icon: "🔬", label: "革新", desc: "テクノロジーで体験を向上。" },
      { icon: "💰", label: "手頃な価格", desc: "競争力のある価格と魅力的なキャンペーン。" },
      { icon: "✅", label: "サービス品質", desc: "充実のサポート、簡単な返品。" },
    ],
  },
  metrics: {
    title: "信頼されるプラットフォーム",
    items: [
      { value: "1000万+", label: "商品数" },
      { value: "5万+", label: "出品者" },
      { value: "2000万+", label: "お客様" },
      { value: "63", label: "配送エリア（省）" },
      { value: "2時間", label: "都市部速達" },
      { value: "365日", label: "年中無休" },
    ],
  },
  whyShop: {
    title: "選ばれる理由",
    subtitle: "優れたショッピング体験",
    items: [
      { icon: "🚚", title: "迅速配送", desc: "都市部2時間、全国1-3日。" },
      { icon: "💲", title: "競争力ある価格", desc: "お得な価格とキャンペーン。" },
      { icon: "🏪", title: "信頼の販売者", desc: "認証済みブランドとショップ。" },
      { icon: "🤖", title: "スマート提案", desc: "AIによるパーソナライズ商品提案。" },
      { icon: "🔒", title: "安全な決済", desc: "複数の安全な支払い方法。" },
      { icon: "↩️", title: "簡単返品", desc: "柔軟な返品ポリシー、迅速な返金。" },
    ],
  },
  tech: {
    title: "テクノロジーと体験",
    subtitle: "最新技術で構築",
    items: [
      "検索から決済まで最適化されたショッピングフロー",
      "お客様の好みに基づくスマート商品提案",
      "デスクトップとモバイルでシームレスな体験",
      "24時間365日、高いセキュリティと安定性",
      "インテリジェントフィルター付き高度検索",
    ],
  },
  cta: {
    title: "始める準備はできましたか？",
    subtitle: "数百万の商品があなたを待っています。今日からスマートショッピングを。",
    btn1: "今すぐ購入",
    btn2: "サポートに連絡",
  },
  langLabel: "言語",
};

export const aboutI18n: Record<Locale, AboutContent> = { vi, en, ja };
