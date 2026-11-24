export interface AgreementPartyInfo {
  name?: string | null;
  farmName?: string | null;
  phone?: string | null;
  email?: string | null;
  citizenId?: string | null;
  citizenCardDate?: string | null;
  farmAddress?: string | null;
}

export interface ContractArticle {
  title: string;
  clauses: string[];
}

export const sellerAgreementLegalBases = [
  "Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015 và các văn bản hướng dẫn thi hành;",
  "Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;",
  "Căn cứ Luật Giao dịch điện tử số 20/2023/QH15 ngày 22/06/2023;",
  "Căn cứ Luật An toàn thực phẩm số 55/2010/QH12 ngày 17/06/2010;",
  "Căn cứ Nghị định số 52/2013/NĐ-CP và Nghị định số 85/2021/NĐ-CP của Chính phủ về Thương mại điện tử;",
  "Căn cứ Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân;",
  "Xét nhu cầu mở gian hàng, phân phối nông sản của Bên B và năng lực cung ứng hạ tầng thương mại điện tử của Bên A.",
] as const;

export const partyAInformation = {
  name: "CÔNG TY CỔ PHẦN CÔNG NGHỆ NÔNG NGHIỆP THÔNG MINH AGRISMART",
  platform: "HỆ THỐNG SÀN THƯƠNG MẠI ĐIỆN TỬ NÔNG SẢN AGRISMART AI",
  representative: "Ban Điều Hành & Quản Trị Sàn AgriSmart",
  address: "Tòa nhà Công nghệ Nông nghiệp AgriSmart, Khu Công nghệ cao, Việt Nam",
  hotline: "1900 8888",
  email: "hotro@agrismart.vn",
  website: "https://agrismart.vn",
} as const;

export const sellerContractArticles: ContractArticle[] = [
  {
    title: "Mục đích và phạm vi hợp tác",
    clauses: [
      "Bên A đồng ý cấp quyền và hạ tầng kỹ thuật để Bên B thiết lập, vận hành gian hàng trực tuyến trên Nền tảng Sàn Thương mại Điện tử AgriSmart AI nhằm trưng bày, giới thiệu và kinh doanh các mặt hàng nông sản, rau củ quả, đặc sản sạch theo đúng quy định pháp luật.",
      "Bên B chủ động quản lý sản phẩm, quy cách đóng gói, mức giá niêm yết, số lượng tồn kho và chịu trách nhiệm pháp lý độc lập về chất lượng hàng hóa mình phân phối.",
      "Hai Bên hợp tác trên nguyên tắc bình đẳng, minh bạch, cùng có lợi, tôn trọng quyền và lợi ích hợp pháp của người tiêu dùng.",
    ],
  },
  {
    title: "Định danh điện tử và xác minh Căn cước công dân (CCCD)",
    clauses: [
      "Theo quy định về định danh chủ thể thương mại điện tử của Bộ Công Thương và pháp luật Việt Nam, Bên B có nghĩa vụ cung cấp chính xác, trung thực số Căn cước công dân (CCCD) 12 chữ số, ngày cấp, cùng hình ảnh chụp 2 mặt Căn cước công dân chính chủ rõ nét, không bị chỉnh sửa hay cắt góc.",
      "Bên A có quyền thẩm định, đối chiếu và hậu kiểm hồ sơ định danh của Bên B. Trong trường hợp dữ liệu CCCD bị mờ, không trùng khớp thông tin tài khoản hoặc có nghi vấn gian lận danh tính, Bên A có quyền từ chối phê duyệt hoặc tạm đình chỉ hoạt động gian hàng cho đến khi Bên B cập nhật lại thông tin hợp lệ.",
      "Bên A cam kết bảo mật tuyệt đối dữ liệu Căn cước công dân và thông tin cá nhân của Bên B theo Nghị định 13/2023/NĐ-CP, chỉ phục vụ công tác xác minh thương nhân và báo cáo quản lý nhà nước khi có yêu cầu hợp pháp.",
    ],
  },
  {
    title: "Tiêu chuẩn chất lượng, nguồn gốc và an toàn thực phẩm",
    clauses: [
      "Toàn bộ nông sản do Bên B đăng bán phải đáp ứng đầy đủ các quy định về an toàn vệ sinh thực phẩm theo Luật An toàn thực phẩm; không sử dụng hóa chất cấm, không tồn dư thuốc bảo vệ thực vật hoặc chất bảo quản vượt ngưỡng cho phép của Bộ Y tế và Bộ Nông nghiệp & Phát triển Nông thôn.",
      "Đối với các sản phẩm được Bên B công bố đạt chuẩn VietGAP, GlobalGAP, Hữu cơ (Organic), OCOP hoặc các chứng chỉ chất lượng khác, Bên B phải có giấy chứng nhận hợp lệ còn thời hạn và sẵn sàng cung cấp cho Bên A hoặc cơ quan chức năng kiểm tra khi có yêu cầu.",
      "Bên B chịu trách nhiệm toàn diện trước pháp luật và người mua hàng nếu nông sản gây ảnh hưởng đến sức khỏe người tiêu dùng do lỗi xuất phát từ quá trình gieo trồng, thu hoạch, xử lý hoặc bảo quản của Bên B.",
    ],
  },
  {
    title: "Quy chế đăng bán, niêm yết giá và xử lý đơn hàng",
    clauses: [
      "Bên B phải niêm yết giá bán công khai bằng Đồng Việt Nam (VND). Giá niêm yết phải rõ ràng theo đơn vị tính (kg, giỏ, thùng, bó...).",
      "Hình ảnh, mô tả sản phẩm, vùng trồng, ngày thu hoạch và quy cách đóng gói phải phản ánh đúng thực tế, không được gây hiểu lầm hoặc cung cấp thông tin sai lệch cho khách hàng.",
      "Khi có đơn hàng phát sinh, Bên B có trách nhiệm xác nhận đơn và hoàn tất khâu chuẩn bị hàng trong vòng tối đa 24 giờ kể từ thời điểm đơn hàng được ghi nhận trên hệ thống.",
    ],
  },
  {
    title: "Đóng gói, bảo quản và vận chuyển nông sản tươi",
    clauses: [
      "Đặc thù hàng nông sản tươi dễ suy giảm chất lượng và dập nát, Bên B có nghĩa vụ đóng gói đúng quy chuẩn kỹ thuật (sử dụng vật liệu chống sốc, đệm lót chuyên dụng, thùng thoáng khí hoặc bảo ôn nhiệt thích hợp).",
      "Trường hợp nông sản bị hư hại, thối ủng do Bên B đóng gói sơ sài, không đúng quy cách, Bên B chịu toàn bộ chi phí bù hàng hoặc bồi hoàn cho người mua.",
      "Quy trình giao nhận từ kho Bên B đến tay khách hàng được thực hiện qua các đối tác giao hàng của AgriSmart hoặc kênh vận chuyển do hai bên thỏa thuận.",
    ],
  },
  {
    title: "Đổi trả, bồi hoàn và giải quyết khiếu nại của khách hàng",
    clauses: [
      "Khách hàng có quyền từ chối nhận hàng hoặc khiếu nại trong vòng 24 - 48 giờ sau khi nhận nếu nông sản bị hư hỏng trên 20%, dập nát nghiêm trọng, giao sai chủng loại hoặc trọng lượng thiếu hụt so với đơn đặt hàng.",
      "Khi nhận được thông báo khiếu nại từ hệ thống, Bên B có trách nhiệm phối hợp với Ban Quản lý Sàn giải quyết trong vòng 24 giờ làm việc bằng một trong các phương án: giao bù sản phẩm mới đạt chuẩn, giảm giá hoặc hoàn tiền thích đáng.",
      "Nếu các bên không thống nhất được nguyên nhân do đóng gói hay do vận chuyển, Ban Quản lý Sàn AgriSmart sẽ làm trung gian kiểm tra hình ảnh/video bằng chứng mở hộp để đưa ra quyết định cuối cùng công bằng cho các bên.",
    ],
  },
  {
    title: "Phí dịch vụ, thanh toán và đối soát doanh thu",
    clauses: [
      "Doanh thu từ các đơn hàng hoàn tất hợp lệ được ghi nhận minh bạch và tức thời trên trang Quản lý Gian hàng (Seller Center) của Bên B.",
      "Chính sách phí dịch vụ nền tảng, phí hoa hồng hoặc phí tiện ích công nghệ (nếu có) được Bên A công bố công khai trước khi áp dụng. Hiện tại trong giai đoạn hỗ trợ nhà vườn, Bên A cam kết các chính sách trợ giá tối đa cho Bên B.",
      "Kỳ đối soát và thanh toán tiền bán hàng cho Bên B được thực hiện định kỳ qua tài khoản ngân hàng chính chủ do Bên B đăng ký trên hệ thống.",
    ],
  },
  {
    title: "Quyền và nghĩa vụ của Bên A (Sàn AgriSmart)",
    clauses: [
      "Cung cấp hạ tầng công nghệ, hệ thống AI tư vấn mua sắm, các công cụ quản lý tồn kho và thống kê doanh thu ổn định, an toàn và bảo mật cho Bên B.",
      "Hỗ trợ tiếp thị, quảng bá nông sản của Bên B đến mạng lưới khách hàng tiêu dùng rộng khắp trên toàn quốc.",
      "Có quyền áp dụng các biện pháp nhắc nhở, tạm ẩn sản phẩm, đình chỉ hoặc đóng vĩnh viễn gian hàng của Bên B nếu Bên B vi phạm nghiêm trọng cam kết chất lượng, bán hàng kém chất lượng hoặc vi phạm pháp luật.",
    ],
  },
  {
    title: "Quyền và nghĩa vụ của Bên B (Chủ gian hàng)",
    clauses: [
      "Được quyền khai thác toàn bộ tiện ích quản lý bán hàng của nền tảng AgriSmart AI; được tham gia các chương trình khuyến mãi, kích cầu tiêu dùng nông sản của Sàn.",
      "Thực hiện đầy đủ nghĩa vụ thuế, đăng ký kinh doanh (nếu thuộc đối tượng bắt buộc) và các nghĩa vụ tài chính khác theo quy định hiện hành của Nhà nước.",
      "Duy trì đạo đức kinh doanh nông sản sạch, xây dựng uy tín thương hiệu nông sản Việt Nam bền vững.",
    ],
  },
  {
    title: "Hiệu lực văn bản và điều khoản thi hành",
    clauses: [
      "Văn bản Hợp đồng này được xác lập dưới dạng Hợp đồng điện tử, có đầy đủ giá trị pháp lý ràng buộc hai Bên theo quy định của Luật Giao dịch điện tử số 20/2023/QH15.",
      "Bằng thao tác tích chọn 'Tôi đã đọc và đồng ý với Hợp đồng hợp tác' và nhấn nút gửi hồ sơ đăng ký, Bên B xác nhận đã đọc, hiểu rõ, đồng ý vô điều kiện và cam kết thi hành nghiêm túc toàn bộ các điều khoản trong văn bản này.",
      "Hợp đồng có hiệu lực chính thức kể từ thời điểm Bên A gửi thông báo phê duyệt hồ sơ định danh và kích hoạt trạng thái hoạt động cho gian hàng của Bên B trên hệ thống AgriSmart.",
    ],
  },
];

// Backwards compatibility array for any legacy views
export const sellerAgreementSections = sellerContractArticles.map((art) => ({
  title: art.title,
  content: art.clauses.join(" "),
}));
