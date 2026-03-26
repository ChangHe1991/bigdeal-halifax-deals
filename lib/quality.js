export function computeFieldCount({ totalPrice, unitPrice, discount, expiresAt }) {
  const fields = [totalPrice, unitPrice, discount, expiresAt].filter((v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  });
  return fields.length;
}

export function computeQuality({ totalPrice, unitPrice, discount, expiresAt, editFactor }) {
  const fieldCount = computeFieldCount({ totalPrice, unitPrice, discount, expiresAt });
  const qualityBase = fieldCount === 4 ? 40 : fieldCount === 3 ? 30 : fieldCount === 2 ? 20 : 0;
  const factor = typeof editFactor === "number" ? editFactor : 1;
  return {
    fieldCount,
    qualityBase,
    quality: qualityBase * factor
  };
}

export function isReasonableDeal({ totalPrice, unitPrice, discount, expiresAt }) {
  const tp = totalPrice === null || totalPrice === undefined ? null : Number(totalPrice);
  const up = unitPrice === null || unitPrice === undefined ? null : Number(unitPrice);
  const d = Number(discount);

  // discount: 支持“折扣额”或“折扣率”，但原型做个宽松校验
  if (!Number.isFinite(d) || d <= 0) return false;
  if (!expiresAt) return false;
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return false;

  // 宽松要求：至少提供“总价或单价”之一
  let hasAnyPrice = false;
  if (tp !== null) {
    if (!Number.isFinite(tp) || tp <= 0) return false;
    hasAnyPrice = true;
  }
  if (up !== null) {
    if (!Number.isFinite(up) || up <= 0) return false;
    hasAnyPrice = true;
  }
  return hasAnyPrice;
}

