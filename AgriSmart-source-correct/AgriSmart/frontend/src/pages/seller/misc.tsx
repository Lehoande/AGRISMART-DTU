"use client";
import { motion } from "framer-motion";
import {
  Star,
  Headphones,
  User,
  FileText,
  Settings,
  Shield,
  Bell,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  TrendingUp,
  Edit,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { SellerLayout } from "@/components/agri/seller-layout";
import { complaints, complaintStatusConfig, formatPrice } from "@/lib/agri-data";

// ============================================
// COMPLAINTS
// ============================================
export function SellerComplaintsPage() {
  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Khiếu nại</h1>
        <p className="text-sm text-stone-500">
          Khiếu nại từ người mua - AgriSmart xử lý công bằng, không tự động quy lỗi
        </p>
      </div>

      <div className="space-y-3">
        {complaints.map((c, i) => {
          const config = complaintStatusConfig[c.status];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-stone-200 p-4"
            >
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span className="font-mono">{c.id}</span>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Đơn: {c.orderId} · Sản phẩm: {c.product}
                  </div>
                </div>
                <div className="text-xs text-stone-500">{c.submittedAt}</div>
              </div>
              <div className="text-xs text-stone-700">
                <strong>Loại vấn đề:</strong> {c.issue}
              </div>
              <div className="text-xs text-stone-600 mt-1">{c.description}</div>
              <div className="flex items-center gap-2 mt-3">
                {c.hasEvidence ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ Có bằng chứng
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    ⚠ Chưa có bằng chứng - có thể "chưa xác định nguyên nhân"
                  </Badge>
                )}
                <Button size="sm" variant="outline" className="ml-auto">
                  Chi tiết
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SellerLayout>
  );
}

// ============================================
// REVIEWS
// ============================================
const sellerReviews = [
  { id: 1, customer: "Nguyễn Thị Lan", avatar: "https://i.pravatar.cc/100?img=44", product: "Sầu Riêng Ri6 Đắk Lắk", rating: 5, comment: "Sầu riêng rất ngon, cơm vàng hạt lép đúng như mô tả!", date: "29/10/2026" },
  { id: 2, customer: "Trần Văn Minh", avatar: "https://i.pravatar.cc/100?img=12", product: "Xoài Cát Hòa Lộc", rating: 5, comment: "Xoài ngọt đậm, giao nhanh, đóng gói cẩn thận.", date: "28/10/2026" },
  { id: 3, customer: "Lê Hoàng Phúc", avatar: "https://i.pravatar.cc/100?img=15", product: "Sầu Riêng Ri6 Đắk Lắk", rating: 4, comment: "Tốt nhưng 1 trái hơi nhỏ so với mong đợi.", date: "28/10/2026" },
  { id: 4, customer: "Phạm Thu Hà", avatar: "https://i.pravatar.cc/100?img=23", product: "Sầu Riêng Ri6 Đắk Lắk", rating: 5, comment: "Gia đình rất thích, sẽ mua lại!", date: "27/10/2026" },
];

export function SellerReviewsPage() {
  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Đánh giá sản phẩm</h1>
        <p className="text-sm text-stone-500">
          Đánh giá từ người mua - chỉ hiển thị sau khi đơn hàng hoàn thành
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center">
          <div className="text-3xl font-extrabold text-amber-500">4.8</div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`size-4 ${s <= 4.8 ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
            ))}
          </div>
          <div className="text-xs text-stone-500 mt-1">Đánh giá trung bình</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-extrabold text-green-600">287</div>
          <div className="text-xs text-stone-500 mt-1">Tổng đánh giá</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-extrabold text-purple-600">94%</div>
          <div className="text-xs text-stone-500 mt-1">Tỷ lệ đánh giá tích cực (4-5★)</div>
        </Card>
      </div>

      <div className="space-y-3">
        {sellerReviews.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-stone-200 p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar className="size-10">
                <AvatarImage src={r.avatar} />
                <AvatarFallback>{r.customer.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-sm">{r.customer}</div>
                    <div className="text-xs text-stone-500">{r.product} · {r.date}</div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`size-4 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-stone-700 mt-2">&ldquo;{r.comment}&rdquo;</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SellerLayout>
  );
}

// ============================================
// PROFILE
// ============================================
export function SellerProfilePage() {
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hồ sơ người bán</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar className="size-20 border-4 border-green-200">
              <AvatarImage src="https://i.pravatar.cc/200?img=33" />
              <AvatarFallback>HTX</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">HTX Nông Nghiệp Krông Pắc</h2>
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="size-3" /> Đã xác thực
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-amber-500">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">4.8</span>
                <span className="text-xs text-stone-500">(287 đánh giá)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-sm">
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Sản phẩm</div>
                  <div className="font-bold">12</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Đơn hoàn thành</div>
                  <div className="font-bold">847</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Tham gia</div>
                  <div className="font-bold text-sm">06/2024</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2">
                  <div className="text-xs text-stone-500">Uy tín</div>
                  <div className="font-bold text-green-600">Tốt</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                <Edit className="size-4 mr-1" /> Chỉnh sửa hồ sơ
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Thông tin liên hệ</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Người đại diện:</span>
              <span className="font-medium">Nguyễn Văn Hùng</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Số điện thoại:</span>
              <span className="font-medium">0901 234 567</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Email:</span>
              <span className="font-medium">huong@krongpac.vn</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Địa chỉ:</span>
              <span className="font-medium">Krông Pắc, Đắk Lắk</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="size-4 text-stone-400" />
              <span className="text-stone-500 w-32">Chứng nhận:</span>
              <div className="flex gap-1">
                <Badge variant="outline" className="bg-green-50 text-green-700">VietGAP</Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">OCOP 5★</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}

// ============================================
// AGREEMENT VIEW
// ============================================
export function SellerAgreementViewPage() {
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Thỏa thuận mua bán và hợp tác</h1>
        <p className="text-sm text-stone-500 mb-6">Phiên bản v1.0 - Cập nhật 01/2026</p>

        <Card className="p-6 space-y-4">
          {[
            "Quyền và nghĩa vụ của người bán",
            "Trách nhiệm cung cấp thông tin",
            "Quy định về chất lượng và nguồn gốc",
            "Xử lý khi sản phẩm không đạt",
            "Xử lý khi xảy ra khiếu nại",
            "Chính sách đổi/trả/hoàn tiền",
            "Cơ chế xử lý khi không xác định nguyên nhân hư hỏng",
            "Chính sách bảo mật dữ liệu",
            "Quyền lợi và doanh thu của người bán",
          ].map((s, i) => (
            <div key={i} className="border-l-4 border-amber-400 pl-4">
              <h3 className="font-bold mb-1">{i + 1}. {s}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Nội dung chi tiết của điều khoản {i + 1}. Vui lòng liên hệ AgriSmart nếu cần làm rõ.
              </p>
            </div>
          ))}
        </Card>
      </div>
    </SellerLayout>
  );
}

// ============================================
// SETTINGS
// ============================================
export function SellerSettingsPage() {
  return (
    <SellerLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

        <Card className="p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell className="size-4 text-amber-600" /> Thông báo
          </h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between">
              <span>Thông báo đơn hàng mới</span>
              <Checkbox defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Thông báo khiếu nại</span>
              <Checkbox defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Thông báo trạng thái lô hàng</span>
              <Checkbox defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Báo cáo doanh thu hàng ngày</span>
              <Checkbox />
            </label>
          </div>
        </Card>

        <Card className="p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="size-4 text-green-600" /> Bảo mật
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="size-4 mr-2" /> Đổi mật khẩu
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="size-4 mr-2" /> Xác thực 2 bước
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="size-4 text-blue-600" /> Khác
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Wheat className="size-4 mr-2" /> Chuyển sang chế độ Người mua
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              Đăng xuất
            </Button>
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}
