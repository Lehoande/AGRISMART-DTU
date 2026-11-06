// Khớp ENUM của schema: pending, confirmed, shipping, completed, cancelled
// (tài liệu Project Plan gọi tương ứng: Pending, Processing, Shipping, Delivered)
const STATUSES = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
};

const STATUS_VI = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận / đang xử lý',
  shipping: 'Đang giao hàng',
  completed: 'Đã giao thành công',
  cancelled: 'Đã huỷ',
};

const canTransition = (from, to) => Boolean(TRANSITIONS[from] && TRANSITIONS[from].includes(to));

module.exports = { STATUSES, TRANSITIONS, STATUS_VI, canTransition };
