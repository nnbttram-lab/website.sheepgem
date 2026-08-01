/**
 * SHEEP GEM — SITE CONTENT (published via admin.html)
 *
 * BILINGUAL SCHEMA: any field you see as { "en": "...", "vi": "..." } is
 * translatable text — admin.html will show you both language boxes side by
 * side for these. Plain string/number fields (ids, hrefs, colors, image
 * paths, prices, contact details) are NOT translated — they're the same in
 * every language on purpose.
 */

window.SITE_CONTENT = {
  "site": {
    "name": "Sheep Gem",
    "logoText": "Sheep Gem",
    "tagline": {
      "en": "Feng Shui Stones for a Balanced Life",
      "vi": "Đá Phong Thuỷ Cho Cuộc Sống Cân Bằng"
    },
    "year": 2026
  },
  "nav": [
    { "href": "#home", "label": { "en": "Home", "vi": "Trang chủ" } },
    { "href": "#nangluong", "label": { "en": "Energy", "vi": "Năng lượng" } },
    { "href": "#products", "label": { "en": "Feng Shui Stones", "vi": "Đá phong thuỷ" } },
    { "href": "#about", "label": { "en": "What Makes Us Different", "vi": "Điều khác biệt" } },
    { "href": "#contact", "label": { "en": "Contact", "vi": "Liên hệ" } }
  ],
  "hero": {
    "eyebrow": {
      "en": "Not just a piece of jewelry.",
      "vi": "Không chỉ là một món trang sức."
    },
    "headline": {
      "en": "Your accessory is the energy you choose to carry every day",
      "vi": "Phụ kiện là năng lượng bạn chọn mang theo mỗi ngày"
    },
    "subheadline": {
      "en": "We believe no single stone can change your life.\n\nBut it can become a daily reminder of who you're choosing to become.",
      "vi": "Cừu tin rằng mỗi viên đá không thay đổi cuộc đời bạn.\n\nNhưng nó có thể trở thành lời nhắc nhở về con người mà bạn muốn trở thành."
    },
    "ctaPrimaryText": { "en": "Get Styling Advice", "vi": "Cừu tư vấn" },
    "ctaPrimaryHref": "#contact",
    "ctaSecondaryText": { "en": "Browse on My Own", "vi": "Mình tự đi tìm" },
    "ctaSecondaryHref": "#products",
    "image": "images/hero-stones.jpg"
  },
  "about": {
    "heading": {
      "en": "Every piece carries something you want to remind yourself of, every day.",
      "vi": "Mỗi món trang sức đều mang theo một điều bạn muốn nhắc chính mình mỗi ngày."
    },
    "body": {
      "en": "Inner energy needs nurturing too.\n\nWe believe every piece of jewelry carries its own meaning.\n\nThat's why Sheep Gem always starts with your story, not with an order.\n\nWe listen, so we can help you find the piece that fits the stage of life you're in.",
      "vi": "Năng lượng bên trong cũng cần được nuôi dưỡng.\n\nChúng tôi tin rằng mỗi món trang sức đều mang theo một ý nghĩa riêng.\n\nVì thế, Sheep Gem luôn bắt đầu bằng câu chuyện của bạn, không phải bằng một đơn hàng.\n\nChúng tôi lắng nghe để cùng bạn tìm ra món trang sức phù hợp với giai đoạn bạn đang trải qua."
    },
    "stats": [
      { "value": "1", "label": { "en": "1 story, 1 stone line", "vi": "1 câu chuyện, 1 dòng đá" } },
      { "value": "0", "label": { "en": "0 judgment", "vi": "0 phán xét" } },
      { "value": "∞", "label": { "en": "meaning", "vi": "ý nghĩa" } }
    ]
  },
  "intentionsSection": {
    "title": { "en": "Shop by Intention", "vi": "Chọn Đá Theo Mục Đích" },
    "subtitle": {
      "en": "Every stone corresponds to a bagua area and a purpose. Find yours.",
      "vi": "Mỗi viên đá tương ứng với một cung bát quái và một mục đích riêng. Tìm viên đá của bạn."
    }
  },
  "intentions": [
    {
      "id": "wealth",
      "name": { "en": "Wealth & Abundance", "vi": "Tài Lộc & Thịnh Vượng" },
      "stone": { "en": "Citrine", "vi": "Thạch Anh Vàng" },
      "meta": { "en": "Wood Element · Bagua: Southeast", "vi": "Mệnh Mộc · Cung Đông Nam" },
      "description": {
        "en": "Placed in the wealth corner to invite prosperity and opportunity.",
        "vi": "Đặt ở góc tài lộc để thu hút sự thịnh vượng và cơ hội."
      },
      "color": "#d9a441"
    },
    {
      "id": "love",
      "name": { "en": "Love & Relationships", "vi": "Tình Yêu & Các Mối Quan Hệ" },
      "stone": { "en": "Rose Quartz", "vi": "Thạch Anh Hồng" },
      "meta": { "en": "Fire Element · Bagua: Southwest", "vi": "Mệnh Hỏa · Cung Tây Nam" },
      "description": {
        "en": "Softens energy in shared spaces and supports connection.",
        "vi": "Làm dịu năng lượng trong không gian chung và nuôi dưỡng sự kết nối."
      },
      "color": "#e3a9a1"
    },
    {
      "id": "protection",
      "name": { "en": "Protection & Grounding", "vi": "Bảo Vệ & Vững Vàng" },
      "stone": { "en": "Black Tourmaline", "vi": "Tourmaline Đen" },
      "meta": { "en": "Water Element · Bagua: North", "vi": "Mệnh Thủy · Cung Bắc" },
      "description": {
        "en": "Traditionally kept near entryways to absorb negative energy.",
        "vi": "Theo truyền thống được đặt gần lối vào để hấp thụ năng lượng tiêu cực."
      },
      "color": "#3a3a3a"
    },
    {
      "id": "career",
      "name": { "en": "Career & Path", "vi": "Sự Nghiệp & Con Đường" },
      "stone": { "en": "Pyrite", "vi": "Pyrite" },
      "meta": { "en": "Metal Element · Bagua: Northwest", "vi": "Mệnh Kim · Cung Tây Bắc" },
      "description": {
        "en": "Encourages focus, confidence, and forward momentum.",
        "vi": "Khuyến khích sự tập trung, tự tin và động lực tiến về phía trước."
      },
      "color": "#b8a24a"
    },
    {
      "id": "health",
      "name": { "en": "Health & Family", "vi": "Sức Khỏe & Gia Đình" },
      "stone": { "en": "Green Jade", "vi": "Ngọc Bích Xanh" },
      "meta": { "en": "Wood Element · Bagua: East", "vi": "Mệnh Mộc · Cung Đông" },
      "description": {
        "en": "A classic feng shui stone for vitality and family harmony.",
        "vi": "Một viên đá phong thủy kinh điển cho sức sống và sự hòa thuận trong gia đình."
      },
      "color": "#5f8f6e"
    },
    {
      "id": "wisdom",
      "name": { "en": "Wisdom & Clarity", "vi": "Trí Tuệ & Sự Sáng Suốt" },
      "stone": { "en": "Amethyst", "vi": "Thạch Anh Tím" },
      "meta": { "en": "Water Element · Bagua: Northeast", "vi": "Mệnh Thủy · Cung Đông Bắc" },
      "description": {
        "en": "Supports calm thinking, study, and quiet reflection.",
        "vi": "Hỗ trợ tư duy bình tĩnh, học tập và chiêm nghiệm."
      },
      "color": "#7b5ea7"
    }
  ],
  "productsSection": {
    "title": { "en": "Featured Stones", "vi": "Đá Nổi Bật" },
    "subtitle": {
      "en": "A starting collection for every corner of your home.",
      "vi": "Bộ sưu tập khởi đầu cho mọi góc nhà bạn."
    }
  },
  "products": [
    {
      "id": "p1",
      "name": { "en": "Citrine Cluster", "vi": "Cụm Thạch Anh Vàng Thô" },
      "intention": "wealth",
      "price": 48,
      "description": {
        "en": "Raw citrine cluster for the wealth corner of your home or desk.",
        "vi": "Cụm thạch anh vàng thô dành cho góc tài lộc trong nhà hoặc trên bàn làm việc."
      },
      "image": "images/products/citrine-cluster.jpg"
    },
    {
      "id": "p2",
      "name": { "en": "Rose Quartz Heart", "vi": "Trái Tim Thạch Anh Hồng" },
      "intention": "love",
      "price": 32,
      "description": {
        "en": "Hand-polished rose quartz heart, ideal for the bedroom or shared spaces.",
        "vi": "Trái tim thạch anh hồng được mài thủ công, phù hợp cho phòng ngủ hoặc không gian chung."
      },
      "image": "images/products/rose-quartz-heart.jpg"
    },
    {
      "id": "p3",
      "name": { "en": "Black Tourmaline Tower", "vi": "Tháp Tourmaline Đen" },
      "intention": "protection",
      "price": 40,
      "description": {
        "en": "Polished tourmaline tower for entryways and front-door protection.",
        "vi": "Tháp tourmaline đen đánh bóng, dùng cho lối vào và bảo vệ trước cửa nhà."
      },
      "image": "images/products/black-tourmaline-tower.jpg"
    },
    {
      "id": "p4",
      "name": { "en": "Pyrite Cube", "vi": "Khối Pyrite" },
      "intention": "career",
      "price": 36,
      "description": {
        "en": "Natural pyrite cube for the desk — clarity and career momentum.",
        "vi": "Khối pyrite tự nhiên đặt trên bàn làm việc — mang lại sự minh mẫn và động lực sự nghiệp."
      },
      "image": "images/products/pyrite-cube.jpg"
    },
    {
      "id": "p5",
      "name": { "en": "Green Jade Bracelet", "vi": "Vòng Tay Ngọc Bích Xanh" },
      "intention": "health",
      "price": 54,
      "description": {
        "en": "Beaded green jade bracelet for everyday wear and family harmony.",
        "vi": "Vòng tay ngọc bích xanh dạng hạt, đeo hàng ngày để mang lại sự hòa thuận gia đình."
      },
      "image": "images/products/green-jade-bracelet.jpg"
    },
    {
      "id": "p6",
      "name": { "en": "Amethyst Geode", "vi": "Đá Thạch Anh Tím Nguyên Khối" },
      "intention": "wisdom",
      "price": 65,
      "description": {
        "en": "Small amethyst geode for the study or meditation corner.",
        "vi": "Khối thạch anh tím nhỏ cho góc học tập hoặc thiền định."
      },
      "image": "images/products/amethyst-geode.jpg"
    }
  ],
  "testimonialsSection": {
    "title": { "en": "What Customers Say", "vi": "Khách Hàng Nói Gì" }
  },
  "testimonials": [
    {
      "quote": {
        "en": "I placed the citrine cluster in my wealth corner and, coincidence or not, closed two new clients that same month.",
        "vi": "Tôi đặt cụm thạch anh vàng ở góc tài lộc, và dù là trùng hợp hay không, tháng đó tôi đã chốt được hai khách hàng mới."
      },
      "author": "Mai T.",
      "location": "Austin, TX"
    },
    {
      "quote": {
        "en": "The black tourmaline by my front door has become part of my daily routine. Beautiful piece, thoughtfully packaged.",
        "vi": "Viên tourmaline đen đặt trước cửa nhà đã trở thành một phần thói quen hàng ngày của tôi. Sản phẩm đẹp, đóng gói chỉn chu."
      },
      "author": "Daniel R.",
      "location": "Portland, OR"
    },
    {
      "quote": {
        "en": "Customer service actually explained where each stone should go and why. Felt like getting a mini feng shui consultation.",
        "vi": "Dịch vụ khách hàng thực sự giải thích rõ nên đặt từng viên đá ở đâu và vì sao. Cảm giác như được tư vấn phong thủy thu nhỏ."
      },
      "author": "Priya S.",
      "location": "Chicago, IL"
    }
  ],
  "newsletter": {
    "heading": { "en": "Get Feng Shui Tips in Your Inbox", "vi": "Nhận Mẹo Phong Thủy Qua Email" },
    "body": {
      "en": "Monthly stone spotlights, placement guides, and early access to new arrivals.",
      "vi": "Giới thiệu đá hàng tháng, hướng dẫn cách đặt đá, và quyền truy cập sớm sản phẩm mới."
    },
    "ctaText": { "en": "Subscribe", "vi": "Đăng Ký" },
    "emailPlaceholder": { "en": "Your email address", "vi": "Địa chỉ email của bạn" },
    "successMessage": {
      "en": "Thanks for subscribing! (Hook this form up to your email provider when ready.)",
      "vi": "Cảm ơn bạn đã đăng ký! (Kết nối form này với dịch vụ email khi sẵn sàng.)"
    }
  },
  "contact": {
    "heading": { "en": "Visit or Reach Out", "vi": "Ghé Thăm Hoặc Liên Hệ" },
    "emailLabel": { "en": "Email:", "vi": "Email:" },
    "phoneLabel": { "en": "Phone:", "vi": "Điện thoại:" },
    "addressLabel": { "en": "Address:", "vi": "Địa chỉ:" },
    "email": "hello@sheepgem.com",
    "phone": "+1 (555) 016-2847",
    "address": "128 Lotus Lane, Suite 4, Austin, TX 78701",
    "social": [
      { "label": "Instagram", "href": "https://instagram.com/sheep.gem" },
      { "label": "Pinterest", "href": "https://pinterest.com/sheepgem" },
      { "label": "TikTok", "href": "https://tiktok.com/@sheep.gem" }
    ]
  },
  "footer": {
    "links": [
      { "label": { "en": "Shipping & Returns", "vi": "Vận Chuyển & Đổi Trả" }, "href": "#" },
      { "label": { "en": "Stone Care Guide", "vi": "Hướng Dẫn Bảo Quản Đá" }, "href": "#" },
      { "label": { "en": "Wholesale Inquiries", "vi": "Hợp Tác Bán Sỉ" }, "href": "#" },
      { "label": { "en": "Privacy Policy", "vi": "Chính Sách Bảo Mật" }, "href": "#" }
    ],
    "copyright": { "en": "Sheep Gem. All rights reserved.", "vi": "Sheep Gem. Bảo lưu mọi quyền." }
  }
};
