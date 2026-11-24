export interface BuyerAgreementPartyInfo {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface BuyerContractArticle {
  title: string;
  clauses: string[];
}

export const buyerAgreementLegalBases = [
  "Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015 và các văn bản hướng dẫn thi hành;",
  "Căn cứ Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15 ngày 20/06/2023;",
  "Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;",
  "Căn cứ Luật Giao dịch điện tử số 20/2023/QH15 ngày 22/06/2023;",
  "Căn cứ Luật An toàn thực phẩm số 55/2010/QH12 ngày 17/06/2010;",
  "Căn cứ Nghị định số 52/2013/NĐ-CP và Nghị định số 85/2021/NĐ-CP của Chính phủ về Thương mại điện tử;",
  "Căn cứ Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân;",
  "Xét nhu cầu tiêu dùng nông sản sạch của Bên B và năng lực cung ứng dịch vụ sàn thương mại điện tử của Bên A.",
] as const;

export const buyerContractArticles: BuyerContractArticle[] = [
  {
    title: "Mục đích và phạm vi sử dụng dịch vụ",
    clauses: [
      "Hợp đồng này quy định các quyền lợi, nghĩa vụ và trách nhiệm pháp lý giữa Bên A (Sàn AgriSmart) và Bên B (Người mua hàng) trong việc tiếp cận, tìm kiếm thông tin, đặt mua nông sản và sử dụng các dịch vụ liên quan trên nền tảng AgriSmart AI.",
      "Bên B được quyền tự do lựa chọn nông sản sạch, xem chi tiết nguồn gốc xuất xứ vùng trồng, mã lô thu hoạch, tiêu chuẩn chứng nhận và đặt mua trực tiếp từ các nhà vườn, hợp tác xã đối tác uy tín trên toàn quốc.",
      "Mọi giao dịch mua bán được thực hiện trên nguyên tắc tự nguyện, bình đẳng, minh bạch và đảm bảo quyền lợi tối đa cho người tiêu dùng.",
    ],
  },
  {
    title: "Tài khoản khách hàng và bảo mật dữ liệu cá nhân",
    clauses: [
      "Bên B có nghĩa vụ cung cấp thông tin liên hệ chính xác (họ tên, số điện thoại, địa chỉ nhận hàng) khi đăng ký tài khoản để phục vụ công tác giao nhận và liên lạc đơn hàng.",
      "Bên A cam kết bảo vệ dữ liệu cá nhân của Bên B theo Nghị định 13/2023/NĐ-CP của Chính phủ. Thông tin cá nhân của Bên B chỉ được sử dụng cho mục đích vận hành tài khoản, điều phối giao hàng và hỗ trợ hậu mãi; tuyệt đối không tiết lộ, chuyển giao hay mua bán cho bên thứ ba vì mục đích thương mại khác khi chưa có sự đồng ý của Bên B.",
      "Bên B có trách nhiệm tự bảo mật mật khẩu và thiết bị đăng nhập cá nhân nhằm phòng ngừa truy cập trái phép.",
    ],
  },
  {
    title: "Tiêu chuẩn chất lượng nông sản và quyền được thông tin",
    clauses: [
      "Bên B có quyền được cung cấp thông tin trung thực, chính xác và minh bạch về sản phẩm nông sản: tên gọi, giống cây trồng, địa chỉ nông trại, ngày thu hoạch, hạn dùng, quy cách đóng gói và hình ảnh thực tế.",
      "Đối với các sản phẩm được công bố tiêu chuẩn chất lượng (VietGAP, GlobalGAP, Organic, OCOP...), Bên B có quyền tra cứu mã lô và thông tin chứng thực tương ứng trên hệ thống.",
      "Bên A chịu trách nhiệm kiểm duyệt thông tin gian hàng và áp dụng quy chế nghiêm ngặt buộc các nhà vườn cam kết an toàn vệ sinh thực phẩm, không tồn dư hóa chất độc hại.",
    ],
  },
  {
    title: "Đặt hàng, niêm yết giá và phương thức thanh toán",
    clauses: [
      "Giá bán của nông sản được niêm yết công khai bằng Đồng Việt Nam (VND). Giá niêm yết là giá cuối cùng áp dụng cho đơn vị đóng gói đã bao gồm các loại thuế phí theo quy định pháp luật.",
      "Bên B có quyền lựa chọn các hình thức thanh toán an toàn và tiện lợi được hệ thống hỗ trợ: Thanh toán khi nhận hàng (COD) hoặc Chuyển khoản qua ngân hàng.",
      "Đơn hàng được xem là xác nhận thành công khi Bên B hoàn tất bước đặt mua và hệ thống gửi thông báo xác nhận đơn hàng qua tài khoản.",
    ],
  },
  {
    title: "Đóng gói, giao nhận nông sản tươi và chính sách phí vận chuyển",
    clauses: [
      "Do đặc thù hàng tươi sống dễ dập úng, toàn bộ nông sản được yêu cầu đóng gói kỹ thuật chuyên biệt (hộp chống sốc, thùng carton thoáng khí hoặc vật liệu giữ nhiệt phù hợp) trước khi giao cho đơn vị vận chuyển.",
      "Chính sách cước vận chuyển được áp dụng công khai, minh bạch: Mức phí giao hàng tiêu chuẩn là 25.000 ₫/đơn hàng; miễn phí 100% phí giao hàng cho tất cả các đơn hàng có giá trị từ 250.000 ₫ trở lên.",
      "Khi nhận hàng, Bên B có quyền yêu cầu đồng kiểm ngoại quan (kiểm tra tình trạng nguyên vẹn bên ngoài thùng hàng) cùng nhân viên giao hàng trước khi nhận hoặc thanh toán tiền mặt.",
    ],
  },
  {
    title: "Chính sách đổi trả, hoàn tiền và bảo vệ người tiêu dùng",
    clauses: [
      "Bên B có quyền gửi khiếu nại yêu cầu đổi trả hoặc bồi hoàn trong vòng 24 - 48 giờ kể từ thời điểm nhận hàng nếu nông sản gặp các sự cố: dập nát, thối hỏng trên 20%, không đúng chủng loại, thiếu trọng lượng hoặc chất lượng không đúng với mô tả trên sàn.",
      "Bên A cam kết tiếp nhận bằng chứng (hình ảnh, video chụp sản phẩm và phiếu giao hàng) và phối hợp với nhà vườn giải quyết dứt điểm trong vòng 24 giờ bằng các phương án thỏa đáng: giao bù hàng tươi mới miễn phí hoặc hoàn tiền tương ứng vào tài khoản của Bên B.",
      "Trong trường hợp phát sinh tranh chấp nguyên nhân hư hỏng, Ban Quản trị Sàn AgriSmart sẽ đứng ra làm trọng tài độc lập, căn cứ vào bằng chứng thực tế để bảo vệ quyền lợi người tiêu dùng một cách công bằng nhất.",
    ],
  },
  {
    title: "Quyền và nghĩa vụ của Bên A (Sàn TMĐT AgriSmart)",
    clauses: [
      "Duy trì hệ thống công nghệ vận hành liên tục, ổn định; tích hợp Trợ lý AI AgriSmart hỗ trợ tư vấn mùa vụ, công dụng và gợi ý nông sản 24/7.",
      "Bảo đảm an toàn giao dịch, bảo vệ quyền lợi người tiêu dùng, kịp thời xử lý các gian hàng vi phạm chất lượng hoặc có hành vi gian dối nguồn gốc nông sản.",
      "Tiếp nhận và giải quyết mọi phản ánh, khiếu nại của Bên B qua Tổng đài chăm sóc khách hàng 1900 8888 hoặc kênh Khiếu nại trực tuyến trên ứng dụng.",
    ],
  },
  {
    title: "Quyền và nghĩa vụ của Bên B (Người mua hàng)",
    clauses: [
      "Được quyền tham gia các chương trình khuyến mãi, ưu đãi thành viên và chính sách tích điểm của Sàn.",
      "Cung cấp địa chỉ nhận hàng chi tiết và số điện thoại liên lạc chính xác; chủ động giữ liên lạc để đơn vị vận chuyển giao hàng đúng tiến độ.",
      "Thực hiện giao dịch văn minh, không hủy đơn hàng vô cớ khi hàng nông sản tươi đã được thu hoạch và xuất kho đóng gói.",
    ],
  },
  {
    title: "Đánh giá, phản hồi và văn hóa cộng đồng",
    clauses: [
      "Sau khi đơn hàng hoàn tất, Bên B có quyền viết đánh giá xếp hạng từ 1 đến 5 sao và để lại nhận xét công khai về chất lượng nông sản cũng như thái độ phục vụ của người bán.",
      "Các phản hồi của Bên B phải dựa trên trải nghiệm thực tế, trung thực, mang tính xây dựng và không vi phạm thuần phong mỹ tục.",
    ],
  },
  {
    title: "Hiệu lực văn bản và điều khoản thi hành",
    clauses: [
      "Văn bản Hợp đồng này được lập dưới dạng chứng từ điện tử, có giá trị pháp lý ràng buộc tương đương văn bản hợp đồng bằng giấy theo quy định của Luật Giao dịch điện tử số 20/2023/QH15.",
      "Bằng việc tích chọn 'Tôi đã đọc và đồng ý với Điều khoản mua hàng & Thỏa thuận bảo vệ người tiêu dùng' và nhấn nút hoàn tất đăng ký, Bên B xác nhận đã đọc, hiểu rõ, đồng ý và tự nguyện cam kết tuân thủ toàn bộ các điều khoản trong Hợp đồng này.",
      "Hợp đồng có hiệu lực chính thức kể từ thời điểm tài khoản người mua của Bên B được hệ thống AgriSmart khởi tạo thành công.",
    ],
  },
];
