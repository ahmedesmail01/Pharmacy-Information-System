import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { lookupService } from "@/api/lookupService";
import { AppLookupMasterDto, AppLookupDetailDto } from "@/types";

interface LookupCache {
  [masterCode: string]: AppLookupDetailDto[];
}

interface LookupContextType {
  getLookupValue: (
    masterCode: string,
    detailId: string | null | undefined,
    language: string,
  ) => string;
  getLookupDetails: (masterCode: string) => AppLookupDetailDto[];
  refreshLookups: (masterCodes?: string[]) => Promise<void>;
  isLoading: boolean;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

const CACHE_KEY = "pharmacy_lookup_cache";

export const LookupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cache, setCache] = useState<LookupCache>(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshLookups = useCallback(
    async (masterCodes?: string[]) => {
      setIsLoading(true);
      try {
        // If specific codes are provided, fetch only those. Otherwise, we might want to fetch common ones.
        // For now, let's implement a way to fetch by code and merge into cache.
        if (masterCodes) {
          const newCache = { ...cache };
          await Promise.all(
            masterCodes.map(async (code) => {
              try {
                const res = await lookupService.getByCode(code);
                if (res.data.success && res.data.data) {
                  newCache[code] = res.data.data.lookupDetails || [];
                }
              } catch (err) {
                console.error(`Failed to fetch lookup: ${code}`, err);
              }
            }),
          );
          setCache(newCache);
          localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cache],
  );

  const getLookupDetails = useCallback(
    (masterCode: string) => {
      return cache[masterCode] || [];
    },
    [cache],
  );

  const getLookupValue = useCallback(
    (
      masterCode: string,
      detailId: string | null | undefined,
      language: string,
    ) => {
      if (!detailId) return "";
      const details = cache[masterCode] || [];
      const detail = details.find((d) => d.oid === detailId);
      if (!detail) return "";
      return language === "ar"
        ? detail.valueNameAr || detail.valueNameEn || ""
        : detail.valueNameEn || "";
    },
    [cache],
  );

  // Initial fetch of commonly used lookups if cache is empty
  useEffect(() => {
    if (Object.keys(cache).length === 0) {
      refreshLookups([
        "PAYMENT_METHOD",
        "INVOICE_STATUS",
        "DOSAGE_FORM",
        "VAT_TYPE",
        "STAKEHOLDER_TYPE",
      ]);
    }
  }, [cache, refreshLookups]);

  return (
    <LookupContext.Provider
      value={{ getLookupValue, getLookupDetails, refreshLookups, isLoading }}
    >
      {children}
    </LookupContext.Provider>
  );
};

export const useLookup = () => {
  const context = useContext(LookupContext);
  if (context === undefined) {
    throw new Error("useLookup must be used within a LookupProvider");
  }
  return context;
};
