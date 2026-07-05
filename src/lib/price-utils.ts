export interface ParsedPrice {
  mainPrice: string;
  note: string;
}

/**
 * Parses price strings (e.g. "₹1,200/- per hour (Tractor) + Labour charges extra")
 * and extracts the core price and the special highlighted client notice notes.
 */
export function parsePriceString(priceStr: string): ParsedPrice {
  if (!priceStr) return { mainPrice: "", note: "" };

  let mainPrice = priceStr;
  let note = "";

  // 1. Extract "+ Labour..."
  if (priceStr.includes(" + ")) {
    const parts = priceStr.split(" + ");
    mainPrice = parts[0].trim();
    note = "+ " + parts.slice(1).join(" + ").trim();
  }

  // 2. Extract "with guarantee"
  if (mainPrice.toLowerCase().includes("with guarantee")) {
    mainPrice = mainPrice.replace(/with guarantee/gi, "").trim();
    note = note ? `${note} (with guarantee)` : "with guarantee";
  }

  // 3. Extract "(Tractor)"
  if (mainPrice.includes("(Tractor)")) {
    mainPrice = mainPrice.replace(/\(Tractor\)/gi, "").trim();
    note = note ? `(Tractor) ${note}` : "(Tractor)";
  }

  return {
    mainPrice: mainPrice.trim(),
    note: note.trim(),
  };
}

export interface UnitInfo {
  unit: string;
  label: string;
  placeholder: string;
}

/**
 * Resolves pricing units (sqft, cent, trees, plants, hours) from the price string
 * to dynamically prompt for quantities in booking forms.
 */
export function getUnitInfo(priceStr: string | null | undefined): UnitInfo | null {
  if (!priceStr) return null;
  const lower = priceStr.toLowerCase();
  if (lower.includes("per sqft")) return { unit: "sqft", label: "Area Size (Sq. Ft.)", placeholder: "e.g. 1500" };
  if (lower.includes("per cent")) return { unit: "cent", label: "Area Size (Cents)", placeholder: "e.g. 10" };
  if (lower.includes("per acre")) return { unit: "acre", label: "Area Size (Acres)", placeholder: "e.g. 2" };
  if (lower.includes("per tree")) return { unit: "tree", label: "Number of Trees", placeholder: "e.g. 5" };
  if (lower.includes("per plant")) return { unit: "plant", label: "Number of Plants", placeholder: "e.g. 25" };
  if (lower.includes("per hour")) return { unit: "hour", label: "Number of Hours", placeholder: "e.g. 4" };
  return null;
}
