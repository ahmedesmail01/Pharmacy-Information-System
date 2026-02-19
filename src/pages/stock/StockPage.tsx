import { useState } from "react";
import { Package, History, Plus, Shuffle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StockLevels from "./StockLevels";
import StockTransactions from "./StockTransactions";
import StockInForm from "./StockInForm";
import StockTransferForm from "./StockTransferForm";

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<"levels" | "transactions">(
    "levels",
  );
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory & Stock Management">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsTransferOpen(true)}
            className="gap-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <Shuffle className="h-4 w-4" />
            Transfer Stock
          </Button>
          <Button
            onClick={() => setIsStockInOpen(true)}
            className="gap-2 shadow-lg shadow-green-100 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Stock In / Receive
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("levels")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "levels"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package className="h-4 w-4" />
          Stock Levels
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "transactions"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="h-4 w-4" />
          Transaction History
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === "levels" ? <StockLevels /> : <StockTransactions />}
      </div>

      <Modal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        title="Receive New Stock (Stock In)"
        size="lg"
      >
        <StockInForm onSuccess={() => setIsStockInOpen(false)} />
      </Modal>

      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Inventory Transfer (Branch to Branch)"
        size="lg"
      >
        <StockTransferForm onSuccess={() => setIsTransferOpen(false)} />
      </Modal>
    </div>
  );
}
