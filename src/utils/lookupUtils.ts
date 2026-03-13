import { AppLookupDetailDto } from "@/types";
import { SelectOption } from "@/components/ui/Select/types";

/**
 * Converts a list of lookup details into unique Select options.
 * This prevents duplicate key warnings in the Select component.
 */
export const getUniqueOptions = (
  lookups: AppLookupDetailDto[],
  valueSelector: (item: AppLookupDetailDto) => string | number = (item) =>
    String(item.oid),
): SelectOption[] => {
  const seenValues = new Set<string | number>();
  const options: SelectOption[] = [];

  lookups.forEach((item) => {
    const value = valueSelector(item);
    const label = item.valueNameEn || item.valueNameAr || "";

    if (!seenValues.has(value)) {
      seenValues.add(value);
      options.push({ value, label });
    }
  });

  return options;
};
