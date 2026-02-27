import { useEffect, useState } from "react";
import {
  Users,
  Package,
  MapPin,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/shared/StatCard";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { branchService } from "@/api/branchService";
import { productService } from "@/api/productService";
import { systemUserService } from "@/api/systemUserService";
import { salesService } from "@/api/salesService";
import { stockService } from "@/api/stockService";
import { handleApiError } from "@/utils/handleApiError";
import { SalesInvoiceDto, ProductDto, FilterOperation } from "@/types";

export default function DashboardPage() {
  const { t, i18n } = useTranslation("dashboard");
  const tc = useTranslation("common").t;
  const isRtl = i18n.dir() === "rtl";
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    branches: 0,
    products: 0,
    users: 0,
    todaySalesCount: 0,
    todayRevenue: 0,
  });
  const [recentSales, setRecentSales] = useState<SalesInvoiceDto[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Dashboard data fetch logic...
      } catch (err) {
        handleApiError(err, t("loadingDashboard"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const salesColumns = [
    {
      header: t("invoiceNo"),
      accessorKey: "invoiceNumber",
      cell: (info: any) => (
        <span className="font-medium text-blue-600">{info.getValue()}</span>
      ),
    },
    {
      header: t("customer"),
      accessorKey: "customerName",
      cell: (info: any) => info.getValue() || t("walkInCustomer"),
    },
    {
      header: tc("total"),
      accessorKey: "totalAmount",
      cell: (info: any) => (
        <span className="font-bold">${info.getValue()?.toFixed(2)}</span>
      ),
    },
    {
      header: tc("status"),
      accessorKey: "invoiceStatusName",
      cell: (info: any) => (
        <Badge variant={info.getValue() === "Paid" ? "success" : "warning"}>
          {info.getValue()}
        </Badge>
      ),
    },
  ];

  const stockColumns = [
    {
      header: t("product"),
      accessorKey: "drugName",
    },
    {
      header: t("currentStock"),
      accessorKey: "availableQuantity",
      cell: (info: any) => (
        <span className="text-red-600 font-bold">{info.getValue() || 0}</span>
      ),
    },
    {
      header: t("minLevel"),
      accessorKey: "minStockLevel",
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium animate-pulse">
          {t("loadingDashboard")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title={t("title")}>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          {tc("todayIs")}{" "}
          <span className="text-gray-900">
            {format(new Date(), "MMMM do, yyyy")}
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("totalBranches")}
          value={500}
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title={t("totalProducts")}
          value={500}
          icon={Package}
          color="green"
        />
        <StatCard
          title={t("totalUsers")}
          value={500}
          icon={Users}
          color="purple"
        />
        <StatCard
          title={t("todayRevenue")}
          value={`$${500}`}
          icon={TrendingUp}
          trend={{ value: 12, isUp: true }}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title={t("recentSales")} className="h-full">
          <div className="space-y-4">
            <Table columns={salesColumns as any} data={recentSales} />
            <div className="flex justify-end pt-2">
              <Link to="/sales">
                <Button variant="ghost" size="sm" className="gap-2 group">
                  {t("viewAllSales")}
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card title={t("lowStockAlerts")} className="h-full border-red-100">
          <div className="space-y-4">
            <Table columns={stockColumns as any} data={lowStockProducts} />
            <div className="flex justify-end pt-2">
              <Link to="/stock">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 group text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t("manageInventory")}
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
