import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Search, Trash2, Calendar, Hash } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import { rsdService } from "@/api/rsdService";
import { branchService } from "@/api/branchService";
import { BranchDto, RsdProductDto } from "@/types";

export default function RSDPage() {
  const { t } = useTranslation("sidebar");
  const [dispatchNotificationId, setDispatchNotificationId] = useState("");
  const [branchId, setBranchId] = useState(
    "5b4badcc-7088-49bb-a034-c3c6a9409b8b",
  );
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [products, setProducts] = useState<RsdProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.getAll();
        setBranches(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  const handleFetch = async () => {
    if (!dispatchNotificationId) {
      toast.error("Please provide both Notification ID and Branch");
      return;
    }

    setIsLoading(true);
    try {
      const res = await rsdService.getDispatchDetail({
        dispatchNotificationId,
        branchId,
      });

      if (res.data.success && res.data.data?.products) {
        setProducts(res.data.data.products);
        toast.success(res.data.message || "Details fetched successfully");
      } else {
        toast.error(res.data.message || "Failed to fetch details");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = (
    index: number,
    field: keyof RsdProductDto,
    value: any,
  ) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const columns = [
    {
      header: "GTIN",
      accessorKey: "gtin",
      cell: (info: any) => (
        <span className="font-bold text-gray-700">{info.getValue()}</span>
      ),
    },
    {
      header: "Batch No",
      accessorKey: "batchNumber",
      cell: (info: any) => (
        <span className="text-gray-600 font-medium">{info.getValue()}</span>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (info: any) => (
        <Input
          type="number"
          value={info.getValue()}
          onChange={(e) =>
            updateProduct(
              info.row.index,
              "quantity",
              parseInt(e.target.value) || 0,
            )
          }
          className="w-24 bg-transparent border-gray-200 focus:bg-white transition-all h-9"
          icon={<Hash size={14} />}
        />
      ),
    },
    {
      header: "Expiry Date",
      accessorKey: "expiryDate",
      cell: (info: any) => (
        <Input
          type="date"
          value={info.getValue() ? info.getValue().split("T")[0] : ""}
          onChange={(e) =>
            updateProduct(info.row.index, "expiryDate", e.target.value)
          }
          className="w-40 bg-transparent border-gray-200 focus:bg-white transition-all h-9"
          icon={<Calendar size={14} />}
        />
      ),
    },
    {
      header: "",
      id: "actions",
      cell: (info: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeProduct(info.row.index)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t("rsd")}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Drug Track and Trace System Integration
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Dispatch Notification ID
            </label>
            <Input
              placeholder="Enter Notification ID"
              value={dispatchNotificationId}
              onChange={(e) => setDispatchNotificationId(e.target.value)}
              className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-blue-500/20"
              icon={<Search size={18} />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Branch
            </label>
            <Select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              options={branches.map((b) => ({
                value: b.oid,
                label: b.branchName || "",
              }))}
              className="bg-gray-50 border-gray-100 h-[42px]"
            />
          </div>
          <Button
            onClick={handleFetch}
            disabled={isLoading}
            className="h-[42px] px-8 shadow-sm shadow-blue-200 active:scale-95 transition-transform font-bold"
          >
            {isLoading ? "Fetching..." : "Fetch Details"}
          </Button>
        </div>
      </Card>

      {products.length > 0 && (
        <Card className="overflow-hidden border-none shadow-lg bg-white rounded-3xl min-h-[300px]">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Notified Products
                </h2>
                <p className="text-xs text-gray-500 font-medium font-mono uppercase tracking-tight">
                  ID: {dispatchNotificationId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                {products.length} Items
              </span>
              <Button
                variant="primary"
                size="sm"
                className="shadow-sm shadow-blue-200"
                onClick={() => {
                  toast.success(
                    "Ready for next step with " + products.length + " items",
                  );
                  console.log(
                    "Current State to be used in next API:",
                    products,
                  );
                }}
              >
                Accept Dispatch
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={products}
              isLoading={isLoading}
              className="border-separate border-spacing-0"
            />
          </div>
        </Card>
      )}

      {!isLoading && products.length === 0 && (
        <Card className="p-12 border-none shadow-lg bg-white rounded-3xl flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <Search size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700">
              No Details Fetched
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Enter a Dispatch Notification ID and select a branch to view and
              edit notified products.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
