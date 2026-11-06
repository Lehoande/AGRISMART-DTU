function key(part: string) {
  return part.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
}

export function formatShippingAddress(...values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  return values.flatMap((value) => String(value || "").split(",")).map((part) => part.trim()).filter((part) => {
    const normalized = key(part);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  }).join(", ");
}

export function streetAddressFromProfile(address: string | null | undefined, ...administrativeParts: Array<string | null | undefined>) {
  const parts = String(address || "").split(",").map((part) => part.trim()).filter(Boolean);
  const administrativeKeys = new Set(administrativeParts.map((part) => key(String(part || ""))).filter(Boolean));
  while (parts.length && administrativeKeys.has(key(parts.at(-1)!))) parts.pop();
  return parts.join(", ");
}
