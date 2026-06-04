/**
 * Trạng thái đơn hàng (mã nội bộ) — luồng giống sàn TMĐT kiểu Tiki:
 * chờ xác nhận → đã xác nhận → chuẩn bị hàng → đang giao → giao thành công / hủy.
 */
export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang chuẩn bị hàng" },
  { value: "shipped", label: "Đang giao hàng" },
  { value: "delivered", label: "Giao hàng thành công" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

/** Thứ tự các bước trên timeline (không gồm hủy). */
export const ORDER_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
export type OrderFlowCode = (typeof ORDER_FLOW)[number];

export type OrderStatusValue = (typeof ORDER_STATUS_OPTIONS)[number]["value"];

export function orderStatusLabel(status: string): string {
  const o = ORDER_STATUS_OPTIONS.find((x) => x.value === status);
  return o?.label ?? status;
}

export function orderStatusPillClass(status: string): "ok" | "bad" | "warn" | "neutral" {
  switch (status) {
    case "delivered":
      return "ok";
    case "cancelled":
      return "bad";
    case "shipped":
    case "processing":
      return "warn";
    default:
      return "neutral";
  }
}

/** Chỉ số bước hiện tại trong ORDER_FLOW, hoặc -1 nếu hủy / không khớp. */
export function orderFlowIndex(status: string): number {
  if (status === "cancelled") return -1;
  const i = ORDER_FLOW.indexOf(status as OrderFlowCode);
  return i;
}

/** Khách có thể tự hủy trên web (giống Tiki: trước khi giao). */
export function orderCanCustomerCancel(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

export type TimelineStepUi = {
  code: OrderFlowCode;
  label: string;
  hint: string;
  state: "done" | "current" | "upcoming";
};

/** Trạng thái từng bước timeline cho UI chi tiết đơn. */
export function orderTimelineSteps(status: string): TimelineStepUi[] {
  const labels: Record<OrderFlowCode, { label: string; hint: string }> = {
    pending: { label: "Đặt hàng thành công", hint: "Chúng tôi đang chờ xác nhận đơn" },
    confirmed: { label: "Đã xác nhận", hint: "Shop đã tiếp nhận đơn của bạn" },
    processing: { label: "Chuẩn bị hàng", hint: "Đơn đang được đóng gói" },
    shipped: { label: "Đang giao hàng", hint: "Đơn đã bàn giao cho đơn vị vận chuyển" },
    delivered: { label: "Giao hàng thành công", hint: "Đơn đã được giao — cảm ơn bạn" },
  };

  if (status === "cancelled") {
    return ORDER_FLOW.map((code) => ({
      code,
      label: labels[code].label,
      hint: labels[code].hint,
      state: "upcoming" as const,
    }));
  }

  if (status === "delivered") {
    return ORDER_FLOW.map((code) => ({
      code,
      label: labels[code].label,
      hint: labels[code].hint,
      state: "done" as const,
    }));
  }

  const idx = orderFlowIndex(status);
  return ORDER_FLOW.map((code, i) => {
    let state: TimelineStepUi["state"];
    if (idx < 0) state = "upcoming";
    else if (i < idx) state = "done";
    else if (i === idx) state = "current";
    else state = "upcoming";
    return {
      code,
      label: labels[code].label,
      hint: labels[code].hint,
      state,
    };
  });
}
