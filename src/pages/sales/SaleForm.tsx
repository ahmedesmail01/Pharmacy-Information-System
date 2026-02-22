import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  Package,
  Calculator,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { productService } from "@/api/productService";
import { branchService } from "@/api/branchService";
import { stakeholderService } from "@/api/stakeholderService";
import { salesService } from "@/api/salesService";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import {
  ProductDto,
  BranchDto,
  StakeholderDto,
  AppLookupDetailDto,
  CreateSalesInvoiceDto,
} from "@/types";

interface CartItem {
  product: ProductDto;
  quantity: number;
  unitPrice: number;
}

export default function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [customers, setCustomers] = useState<StakeholderDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<AppLookupDetailDto[]>(
    [],
  );

  const [search, setSearch] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Products
      try {
        const pRes = await productService.getAll();
        setProducts(pRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }

      // Fetch Branches
      try {
        const bRes = await branchService.getAll();
        setBranches(bRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }

      // Fetch Customers
      try {
        const cRes = await stakeholderService.getAll({
          stakeholderTypeCode: "CUSTOMER",
        });
        const rawCustomers = cRes.data.data || [];
        setCustomers(
          rawCustomers.map((c: any) => ({
            ...c,
            fullName: c.fullName || c.name || "",
          })),
        );
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }

      // Fetch Payment Methods
      try {
        const lRes = await lookupService.getByCode("PAYMENT_METHOD");
        setPaymentMethods(lRes.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.drugName?.toLowerCase().includes(search.toLowerCase()) ||
          p.gtin?.includes(search),
      )
      .slice(0, 8);
  }, [products, search]);

  const addToCart = (product: ProductDto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.oid === product.oid);
      if (existing) {
        return prev.map((item) =>
          item.product.oid === product.oid
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price || 0 }];
    });
    setSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.oid === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.oid !== productId));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!selectedBranchId) {
      toast.error("Please select a branch");
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateSalesInvoiceDto = {
        branchId: selectedBranchId,
        customerId: selectedCustomerId || undefined,
        invoiceDate: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.product.oid,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxAmount: item.unitPrice * 0.15,
        })),
        totalAmount: totals.total,
        taxAmount: totals.tax,
        paymentMethodId: selectedPaymentMethodId || undefined,
      };

      await salesService.create(dto);
      toast.success("Sale processed successfully");
      setCart([]);
      onSuccess();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[70vh]">
      <div className="xl:col-span-2 space-y-6 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Source Branch"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            options={branches.map((b) => ({
              value: b.oid,
              label: b.branchName ?? "",
            }))}
          />
          <Select
            label="Customer (Optional)"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            options={customers.map((c) => ({
              value: c.oid,
              label: c.fullName ?? "",
            }))}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <Input
            placeholder="Search products by name or scan barcode (GTIN)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-14 text-lg"
          />

          {search && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.oid}
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">
                            {p.drugName}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            GTIN: {p.gtin} | Box of {p.packageSize}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-blue-600">
                          ${p.price?.toFixed(2)}
                        </span>
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                          IN STOCK: {p.availableQuantity || 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 font-medium">
                  No products found matching "{search}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[400px] flex flex-col">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-gray-700">
              <ShoppingCart className="h-4 w-4" />
              Cart Items ({cart.length})
            </h3>
            <button
              onClick={() => setCart([])}
              className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
            >
              Clear Cart
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p className="font-medium italic">
                  Cart is empty. Add products to start.
                </p>
              </div>
            ) : (
              <div className="min-w-[600px] lg:min-w-0">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b border-gray-50">
                    <tr className="text-left text-[10px] text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-3 font-bold">Product</th>
                      <th className="px-6 py-3 font-bold text-center">Qty</th>
                      <th className="px-6 py-3 font-bold text-right">Price</th>
                      <th className="px-6 py-3 font-bold text-right">
                        Subtotal
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cart.map((item) => (
                      <tr
                        key={item.product.oid}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm">
                            {item.product.drugName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Unit: ${item.unitPrice.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.oid, -1)
                              }
                              className="p-1 hover:bg-white rounded border border-gray-200"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.oid, 1)
                              }
                              className="p-1 hover:bg-white rounded border border-gray-200"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-600 text-sm">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeFromCart(item.product.oid)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0 space-y-6">
          <h3 className="font-bold text-gray-700">Order Summary</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal</span>
                <span className="font-medium">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>VAT (15%)</span>
                <span className="font-medium">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-bold text-blue-600 text-2xl tracking-tighter">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="space-y-4">
              <Select
                label="Payment Method"
                value={selectedPaymentMethodId}
                onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                options={paymentMethods.map((pm) => ({
                  value: pm.oid,
                  label: pm.valueNameEn ?? "",
                }))}
              />

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Calculator className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-bold mb-1">POS Calculation</p>
                  <p>
                    Invoices are generated instantly and inventory levels are
                    updated automatically.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-200"
                disabled={cart.length === 0 || isLoading}
                isLoading={isLoading}
              >
                Complete Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
