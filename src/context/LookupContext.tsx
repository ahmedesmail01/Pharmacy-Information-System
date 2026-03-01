import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { lookupService } from "@/api/lookupService";
import { AppLookupMasterDto, AppLookupDetailDto } from "@/types";
import { useAuthStore } from "@/store/authStore";

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

  const refreshLookups = useCallback(async (masterCodes?: string[]) => {
    if (!masterCodes || masterCodes.length === 0) return;

    setIsLoading(true);
    try {
      const results = await Promise.all(
        masterCodes.map(async (code) => {
          try {
            const res = await lookupService.getByCode(code);
            if (res.data.success && res.data.data) {
              return { code, details: res.data.data.lookupDetails || [] };
            }
          } catch (err) {
            console.error(`Failed to fetch lookup: ${code}`, err);
          }
          return null;
        }),
      );

      const validResults = results.filter(
        (r): r is { code: string; details: AppLookupDetailDto[] } => r !== null,
      );

      if (validResults.length > 0) {
        setCache((prev) => {
          const newCache = { ...prev };
          validResults.forEach(({ code, details }) => {
            newCache[code] = details;
          });
          localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
          return newCache;
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated && Object.keys(cache).length === 0) {
      refreshLookups([
        "PAYMENT_METHOD",
        "INVOICE_STATUS",
        "DOSAGE_FORM",
        "VAT_TYPE",
        "STAKEHOLDER_TYPE",
      ]);
    }
  }, [cache, refreshLookups, isAuthenticated]);

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
