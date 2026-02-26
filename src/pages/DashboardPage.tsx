import { useEffect, useState } from "react";
import {
  Users,
  Package,
  MapPin,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { Link } from "react-router-dom";
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
        const today = new Date();
        const startDate = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
        const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");

        // const [branchesRes, productsRes, usersRes, salesRes, lowStockRes] =
        //   await Promise.all([
        //     branchService.getAll(),
        //     productService.getAll(),
        //     systemUserService.getAll(),
        //     salesService.getAll({ startDate, endDate }),
        //     productService.query({
        //       request: {
        //         filters: [
        //           // This is a bit tricky since we need to compare availableQuantity with minStockLevel
        //           // The API might not support cross-field comparison directly in filters.
        //           // For now, we'll fetch products and filter client-side or assume a "low stock" flag if it existed.
        //           // Strictly speaking, SOP says "use Stock query endpoint with filter"
        //           // Let's stick to the SOP instruction as much as possible.
        //         ],
        //         pagination: { pageNumber: 1, pageSize: 5 },
        //         sort: [{ sortBy: "drugName", sortDirection: "asc" }],
        //       },
        //     }),
        //   ]);

        // const todaySales = salesRes.data.data || [];
        // const revenue = todaySales.reduce(
        //   (acc, sale) => acc + (sale.totalAmount || 0),
        //   0,
        // );

        // setStats({
        //   branches: branchesRes.data.data?.length || 0,
        //   products: productsRes.data.data?.length || 0,
        //   users: usersRes.data.data?.length || 0,
        //   todaySalesCount: todaySales.length,
        //   todayRevenue: revenue,
        // });

        // setRecentSales(todaySales.slice(0, 5));

        // Mocking low stock for now if the query system doesn't directly support this logic
        // setLowStockProducts(lowStockRes.data.data?.data.slice(0, 5) || []);
      } catch (err) {
        handleApiError(err, "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const salesColumns = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      cell: (info: any) => (
        <span className="font-medium text-blue-600">{info.getValue()}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (info: any) => info.getValue() || "Walk-in Customer",
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: (info: any) => (
        <span className="font-bold">${info.getValue()?.toFixed(2)}</span>
      ),
    },
    {
      header: "Status",
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
      header: "Product",
      accessorKey: "drugName",
    },
    {
      header: "Current Stock",
      accessorKey: "availableQuantity",
      cell: (info: any) => (
        <span className="text-red-600 font-bold">{info.getValue() || 0}</span>
      ),
    },
    {
      header: "Min Level",
      accessorKey: "minStockLevel",
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading dashboard insights...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Dashboard Overview">
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          Today is{" "}
          <span className="text-gray-900">
            {format(new Date(), "MMMM do, yyyy")}
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Branches"
          value={500}
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={500}
          icon={Package}
          color="green"
        />
        <StatCard title="Total Users" value={500} icon={Users} color="purple" />
        <StatCard
          title="Today's Revenue"
          value={`$${500}`}
          icon={TrendingUp}
          trend={{ value: 12, isUp: true }}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Sales" className="h-full">
          <div className="space-y-4">
            <Table columns={salesColumns as any} data={recentSales} />
            <div className="flex justify-end pt-2">
              <Link to="/sales">
                <Button variant="ghost" size="sm" className="gap-2 group">
                  View all sales
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card title="Low Stock Alerts" className="h-full border-red-100">
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
                  Manage Inventory
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
