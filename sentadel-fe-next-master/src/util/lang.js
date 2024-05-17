export const transQueueStatus = (status) => {
  switch (status) {
    case "APPROVED":
      return "Diterima";
    case "ON_PROGRESS":
      return "Dalam Proses";
    case "REJECTED":
      return "Ditolak";

    default:
      return "-";
  }
};

export const goodsStatus = {
  queued: {
    label: "Dalam antrian",
    value: "queued",
    theme: "blue",
  },
  queue_approved: {
    label: "Antrian diterima",
    value: "queue_approved",
    theme: "blue",
  },
  queue_rejected: {
    label: "Antrian ditolak",
    value: "queue_rejected",
    theme: "blue",
  },
  scanned_in: {
    label: "Barang masuk",
    value: "scanned_in",
    theme: "blue",
  },
  rejected_bucket: {
    label: "Barang ditolak",
    value: "rejected_bucket",
    theme: "red",
  },
  goods_entry: {
    label: "Sudah digrade",
    value: "goods_entry",
    theme: "blue",
  },
  rejected_goods: {
    label: "Barang ditolak (Goods)",
    value: "rejected_goods",
    theme: "red",
  },
  weight_entry: {
    label: "Sudah ditimbang",
    value: "weight_entry",
    theme: "blue",
  },
  approved_by_purchasing: {
    label: "Sudah divalidasi",
    value: "approved_by_purchasing",
    theme: "green",
  },
  grouped: {
    label: "Sudah digulung",
    value: "grouped",
    theme: "blue",
  },
  invoiced: {
    label: "Sudah dibuat invoice",
    value: "invoiced",
    theme: "blue",
  },
  ready_to_ship: {
    label: "Siap dikirim",
    value: "ready_to_ship",
    theme: "blue",
  },
  scanned_out: {
    label: "Dikirim",
    value: "scanned_out",
    theme: "blue",
  },
  shipped: {
    label: "Dalam perjalanan",
    value: "shipped",
    theme: "blue",
  },
  rejected_sample: {
    label: "Sample ditolak",
    value: "rejected_sample",
    theme: "blue",
  },
  rejected_inspection: {
    label: "Ditolak saat inspeksi",
    value: "rejected_inspection",
    theme: "blue",
  },
};
