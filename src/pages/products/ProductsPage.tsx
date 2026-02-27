import { useState, useEffect, useCallback, useRef } from "react";
import {
  Edit2,
  Trash2,
  Search as SearchIcon,
  Plus,
  Filter,
  MoreVertical,
  AlertTriangle,
  Beaker,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProductForm from "./ProductForm";
import { productService } from "@/api/productService";
import { lookupService } from "@/api/lookupService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { ProductDto, AppLookupDetailDto, FilterOperation } from "@/types";

export default function ProductsPage() {
  const { t } = useTranslation("products");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [productTypes, setProductTypes] = useState<AppLookupDetailDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(
    null,
  );
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<ProductDto>({
    service: productService.query,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await lookupService.getByCode("PRODUCT_TYPE");
        setProductTypes(res.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch product types", err);
      }
    };
    fetchLookups();
  }, []);

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "drugName",
        value: searchTerm,
        operation: FilterOperation.Contains,
      });
    }
    if (productTypeId) {
      filters.push({
        propertyName: "productTypeId",
        value: productTypeId,
        operation: FilterOperation.Equals,
      });
    }
    fetch("", filters);
  }, [fetch, searchTerm, productTypeId]);

  // useEffect(() => {
  //   loadData();
  // }, [loadData, pageNumber]);

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.oid, {
          ...formData,
          oid: selectedProduct.oid,
        });
        toast.success(t("productUpdated"));
      } else {
        await productService.create(formData);
        toast.success(t("productCreated"));
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setIsActionLoading(true);
    try {
      await productService.delete(selectedProduct.oid);
      toast.success(t("productDeleted"));
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ✅ track previous filters
  const prevFiltersRef = useRef({ searchTerm: "", productTypeId: "" });

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.searchTerm !== searchTerm || prev.productTypeId !== productTypeId;

    if (filtersChanged) {
      prevFiltersRef.current = { searchTerm, productTypeId };

      // reset to 1 once, and wait for pageNumber effect re-run
      if (pageNumber !== 1) {
        setPageNumber(1);
        return;
      }
    }

    loadData();
  }, [searchTerm, productTypeId, pageNumber, setPageNumber, loadData]);

  // ✅ memoized handlers (prevents SearchBar effects from re-firing)
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setProductTypeId(e.target.value);
    },
    [],
  );

  const columns = [
    {
      header: t("drugName"),
      accessorKey: "drugName",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{info.getValue()}</span>
          <span className="text-xs text-gray-400 font-medium tracking-tight">
            {t("gtin")}: {info.row.original.gtin || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: t("genericName"),
      accessorKey: "genericName",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-wrap max-w-60 text-gray-600">
            {info.getValue()}
          </span>
        </div>
      ),
    },
    {
      header: t("packageType"),
      accessorKey: "packageType",
      cell: (info: any) => (
        <Badge className="bg-blue-50 text-blue-700">
          {/* <Beaker className="h-3 w-3 mr-1" /> */}
          {info.getValue() || "Other"}
        </Badge>
      ),
    },
    // {
    //   header: "Manufacturer",
    //   accessorKey: "manufacturer",
    //   cell: (info: any) =>
    //     info.getValue() || <span className="text-gray-400">---</span>,
    // },
    {
      header: t("price"),
      accessorKey: "price",
      cell: (info: any) => (
        <span className="font-mono font-bold text-blue-600">
          ${info.getValue()?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      header: t("marketingStatus"),
      accessorKey: "marketingStatus",
      cell: (info: any) => (
        <Badge variant={info.getValue() === "1" ? "success" : "danger"}>
          {info.getValue() === 1 ? tc("active") : tc("inactive")}
        </Badge>
      ),
    },
    {
      header: t("legalStatus"),
      accessorKey: "legalStatus",
      cell: (info: any) => (
        <Badge variant={info.getValue() === "1" ? "success" : "danger"}>
          {info.getValue() === 1 ? tc("active") : tc("inactive")}
        </Badge>
      ),
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProduct(info.row.original);
              setIsFormOpen(true);
            }}
            className="text-blue-600  p-0 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProduct(info.row.original);
              setIsDeleteOpen(true);
            }}
            className="text-red-600 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        onAddClick={() => {
          setSelectedProduct(null);
          setIsFormOpen(true);
        }}
        addLabel={t("addProduct")}
      />

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              {tc("search")}
            </label>
            <SearchBar
              onSearch={handleSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              {t("productGroup")}
            </label>
            <Select
              value={productTypeId}
              onChange={handleTypeChange}
              options={productTypes.map((pt) => ({
                value: pt.oid,
                label: pt.valueNameEn || pt.valueNameAr || "",
              }))}
              className="h-[42px]"
            />
          </div>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
          {tc("total")}{" "}
          <span className="font-bold text-gray-900">{totalRecords}</span>{" "}
          {t("title")}
        </div>
      </div>

      <div className="space-y-4">
        <Table columns={columns} data={data} isLoading={isLoading} />
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
        />
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProduct ? t("editProduct") : t("addProduct")}
        size="2xl"
      >
        <ProductForm
          initialData={selectedProduct}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteProduct")}
        message={t("deleteConfirm")}
        isLoading={isActionLoading}
      />
    </div>
  );
}
