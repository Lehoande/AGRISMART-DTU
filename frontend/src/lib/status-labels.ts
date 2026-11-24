export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Tiền mặt khi nhận hàng (COD)",
  banking: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
  card: "Thẻ ngân hàng",
};

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  submitted: "Đã gửi",
  investigating: "Đang xác minh",
  resolved: "Đã xử lý",
  rejected: "Không chấp nhận",
  undetermined: "Chưa xác định nguyên nhân",
};

export function statusLabel(labels: Record<string, string>, value: string) {
  return labels[value] || value;
}
