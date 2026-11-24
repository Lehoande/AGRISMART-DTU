"use client";

import { ArrowLeft, ArrowRight, Brain, ClipboardList, Handshake, Leaf, ShieldCheck, Sprout, Truck, UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNav, type PageId } from "@/lib/nav-store";

type InfoPageId = Extract<PageId, "about-features" | "about-sellers" | "about-buyers" | "about-ai" | "about-policies">;

const pageContent: Record<InfoPageId, { label: string; title: string; description: string; icon: typeof Leaf; points: Array<{ title: string; text: string }> }> = {
  "about-features": {
    label: "Tổng quan nền tảng", title: "AgriSmart hỗ trợ mua bán nông sản như thế nào?",
    description: "Nền tảng kết nối gian hàng và người mua, cung cấp thông tin sản phẩm, quản lý đơn hàng và các công cụ hỗ trợ theo vai trò.", icon: Leaf,
    points: [
      { title: "Danh mục và sản phẩm", text: "Người mua có thể xem mặt hàng đang được gian hàng duyệt mở bán, thông tin giá, đơn vị, tồn kho và ảnh sản phẩm." },
      { title: "Thông tin truy xuất", text: "Trang sản phẩm có thể hiển thị nơi thu hoạch, vùng trồng, ngày thu hoạch, mã lô và điều kiện bảo quản do người bán nhập." },
      { title: "Đặt hàng và giao nhận", text: "Giỏ hàng, phí vận chuyển, thanh toán và trạng thái đơn được thể hiện trong luồng đặt hàng." },
      { title: "Không thay thế kiểm định", text: "Thông tin do gian hàng khai báo cần được đối chiếu với giấy tờ hoặc quy trình kiểm tra thực tế khi cần." },
    ],
  },
  "about-sellers": {
    label: "Dành cho người bán", title: "Quản lý gian hàng và đơn hàng tập trung",
    description: "AgriSmart cung cấp khu vực người bán để đăng ký gian hàng, cập nhật sản phẩm và theo dõi hoạt động bán hàng.", icon: Handshake,
    points: [
      { title: "Đăng ký gian hàng", text: "Người bán cung cấp thông tin đại diện, tên HTX/nông trại và địa chỉ để gửi yêu cầu xét duyệt." },
      { title: "Quản lý sản phẩm và lô", text: "Cập nhật giá, đơn vị, tồn kho, vùng trồng, nơi và ngày thu hoạch, mã lô cùng điều kiện bảo quản." },
      { title: "Theo dõi đơn hàng", text: "Xem đơn phát sinh và cập nhật trạng thái xử lý theo các bước hiện có trong hệ thống." },
      { title: "Công cụ hỗ trợ", text: "Có thể xem cảnh báo tồn kho, rà soát dữ liệu truy xuất và dùng AI tạo bản nháp để người bán kiểm tra." },
    ],
  },
  "about-buyers": {
    label: "Dành cho người mua", title: "Tìm hiểu sản phẩm trước khi đặt hàng",
    description: "Người mua có thể duyệt sản phẩm đang bán, kiểm tra thông tin người bán khai báo và quản lý đơn hàng trong tài khoản.", icon: Users,
    points: [
      { title: "Tìm và so sánh", text: "Xem danh mục, giá theo đơn vị, hàng còn bán, nơi thu hoạch và các thông tin sản phẩm đã được cung cấp." },
      { title: "Giỏ hàng và phí ship", text: "Thêm mặt hàng vào giỏ, xem phí giao dự kiến trước khi xác nhận đặt hàng." },
      { title: "Thanh toán và theo dõi", text: "Chọn phương thức được cấu hình, xem thông tin đơn, trạng thái thanh toán và tiến độ xử lý." },
      { title: "Đánh giá và khiếu nại", text: "Sau khi mua, người dùng đủ điều kiện có thể đánh giá đơn hoàn tất hoặc gửi khiếu nại kèm thông tin liên quan." },
    ],
  },
  "about-ai": {
    label: "AI AgriSmart", title: "AI hỗ trợ quyết định, người dùng vẫn kiểm tra thông tin",
    description: "Trợ lý AI giúp khám phá sản phẩm và xử lý thông tin sẵn có; các gợi ý không thay thế xác minh của con người.", icon: Brain,
    points: [
      { title: "Gợi ý sản phẩm", text: "Xếp hạng theo nhóm sản phẩm, lịch sử tương tác nếu có và lượng hàng còn lại." },
      { title: "Hỏi đáp truy xuất", text: "Trả lời dựa trên hồ sơ mặt hàng đang mở bán; trường còn thiếu sẽ được nêu rõ." },
      { title: "So sánh và lập giỏ", text: "Hỗ trợ đối chiếu giá, đơn vị, nơi thu hoạch, ngày thu hoạch, tồn kho và ước tính giỏ theo ngân sách." },
      { title: "Giới hạn dữ liệu", text: "AI không tự xác minh chứng nhận, chất lượng, nguồn gốc, an toàn thực phẩm hoặc dự báo mùa vụ." },
    ],
  },
  "about-policies": {
    label: "Chính sách và minh bạch", title: "Thông tin rõ ràng trong quá trình giao dịch",
    description: "Các chính sách dưới đây mô tả cách hệ thống hiển thị và xử lý thông tin theo cấu hình hiện tại.", icon: ShieldCheck,
    points: [
      { title: "Nguồn gốc và chứng nhận", text: "Thông tin do người bán cung cấp; trạng thái hiển thị không đồng nghĩa với xác minh độc lập nếu chưa có quy trình kiểm duyệt giấy tờ." },
      { title: "Giá và vận chuyển", text: "Giá được hiển thị theo đơn vị sản phẩm. Phí giao hàng hiển thị ở giỏ và bước thanh toán theo chính sách đang áp dụng." },
      { title: "Chuyển khoản ngân hàng", text: "Nếu chọn chuyển khoản, người mua cần làm theo hướng dẫn tại đơn hàng. Trạng thái thanh toán chỉ được xác nhận theo cơ chế đối soát đang cấu hình." },
      { title: "Khiếu nại", text: "Người mua có thể gửi thông tin về đơn hàng để bộ phận phụ trách xem xét; việc gửi khiếu nại không tự động xác định bên có lỗi." },
    ],
  },
};

const links: Array<{ id: InfoPageId; label: string }> = [
  { id: "about-features", label: "Tính năng" }, { id: "about-sellers", label: "Người bán" },
  { id: "about-buyers", label: "Người mua" }, { id: "about-ai", label: "AI AgriSmart" }, { id: "about-policies", label: "Chính sách" },
];

export function PublicFeaturePage({ page }: { page: InfoPageId }) {
  const navigate = useNav((state) => state.navigate);
  const content = pageContent[page];
  const Icon = content.icon;

  return <div className="min-h-screen bg-stone-50 text-stone-900">
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <button onClick={() => navigate("landing")} className="flex items-center gap-2 font-extrabold text-green-900"><span className="flex size-9 items-center justify-center rounded-xl bg-green-700 text-white"><Sprout className="size-5"/></span>AgriSmart <span className="text-amber-600">AI</span></button>
        <nav aria-label="Giới thiệu AgriSmart" className="flex flex-wrap items-center gap-1">{links.map((link) => <button key={link.id} aria-current={page === link.id ? "page" : undefined} onClick={() => navigate(link.id)} className={`rounded-lg px-3 py-2 text-sm ${page === link.id ? "bg-green-100 font-semibold text-green-800" : "text-stone-600 hover:bg-stone-100"}`}>{link.label}</button>)}</nav>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <Button variant="ghost" className="mb-6" onClick={() => navigate("landing")}><ArrowLeft className="mr-2 size-4"/>Về trang giới thiệu</Button>
      <section className="rounded-3xl bg-gradient-to-br from-green-950 via-green-800 to-green-700 p-7 text-white md:p-12">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/15"><Icon className="size-7 text-amber-300"/></div>
        <p className="text-sm font-semibold uppercase tracking-wider text-green-200">{content.label}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold md:text-5xl">{content.title}</h1>
        <p className="mt-5 max-w-3xl leading-relaxed text-green-100">{content.description}</p>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label={`Giới thiệu ${content.label}`}>
        {content.points.map((point, index) => <article key={point.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-green-50 font-bold text-green-800">{index + 1}</div>
          <h2 className="text-lg font-bold">{point.title}</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">{point.text}</p>
        </article>)}
      </section>
      <aside className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><ClipboardList className="mt-0.5 size-5 shrink-0"/><p>Nội dung trang này dùng để giới thiệu chức năng. Đây không phải trang thao tác mua hàng, quản lý gian hàng hay quản trị.</p></aside>
      <div className="mt-8 flex flex-wrap gap-3">{links.filter((item) => item.id !== page).map((item) => <Button key={item.id} variant="outline" onClick={() => navigate(item.id)}>{item.label}<ArrowRight className="ml-2 size-4"/></Button>)}</div>
      <footer className="mt-12 border-t pt-6 text-sm text-stone-500">AgriSmart AI · Nông sản minh bạch</footer>
    </main>
  </div>;
}

