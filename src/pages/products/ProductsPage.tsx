import { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.oid, formData);
        toast.success("Product updated successfully");
      } else {
        await productService.create(formData);
        toast.success("Product added successfully");
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
      toast.success("Product deleted successfully");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: "GTIN / Drug Name",
      accessorKey: "drugName",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{info.getValue()}</span>
          <span className="text-xs text-gray-400 font-medium tracking-tight">
            GTIN: {info.row.original.gtin || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Product Type",
      accessorKey: "productTypeName",
      cell: (info: any) => (
        <Badge className="bg-blue-50 text-blue-700">
          <Beaker className="h-3 w-3 mr-1" />
          {info.getValue() || "Other"}
        </Badge>
      ),
    },
    {
      header: "Manufacturer",
      accessorKey: "manufacturer",
      cell: (info: any) =>
        info.getValue() || <span className="text-gray-400">---</span>,
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (info: any) => (
        <span className="font-mono font-bold text-blue-600">
          ${info.getValue()?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info: any) => (
        <Badge variant={info.getValue() === 1 ? "success" : "danger"}>
          {info.getValue() === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
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
            className="text-blue-600 h-8 w-8 p-0 hover:bg-blue-50"
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
            className="text-red-600 h-8 w-8 p-0 hover:bg-red-50"
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
        title="Products Inventory"
        onAddClick={() => {
          setSelectedProduct(null);
          setIsFormOpen(true);
        }}
        addLabel="Add Product"
      />

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Search Products
            </label>
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by drug name or GTIN..."
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Category Filter
            </label>
            <Select
              value={productTypeId}
              onChange={(e) => setProductTypeId(e.target.value)}
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
          Found <span className="font-bold text-gray-900">
            {totalRecords}
          </span>{" "}
          matching products
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
        title={
          selectedProduct
            ? `Edit ${selectedProduct.drugName}`
            : "Add New Product"
        }
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
        title="Delete Product"
        message={`Are you sure you want to remove "${selectedProduct?.drugName}" from the inventory? This action is permanent.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}
