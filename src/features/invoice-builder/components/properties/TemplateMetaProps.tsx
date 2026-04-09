import { useTemplateStore } from "../../store/templateStore";

export function TemplateMetaProps() {
  const { template, setTemplateMeta } = useTemplateStore();
  const meta = template.meta;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Paper Size
        </label>
        <select
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
          value={meta.paperSize || "A4"}
          onChange={(e) =>
            setTemplateMeta({ paperSize: e.target.value as "A4" | "Letter" })
          }
        >
          <option value="A4">A4</option>
          <option value="Letter">US Letter</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Currency
        </label>
        <select
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
          value={meta.currency || "USD"}
          onChange={(e) => setTemplateMeta({ currency: e.target.value })}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="SAR">SAR (ر.س)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Primary Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={meta.primaryColor || "#1a1a2e"}
            onChange={(e) => setTemplateMeta({ primaryColor: e.target.value })}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <span className="text-sm text-gray-600">
            {meta.primaryColor || "#1a1a2e"}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Margins (px)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Top</span>
            <input
              type="number"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={meta.margins?.top ?? 40}
              onChange={(e) =>
                setTemplateMeta({
                  margins: { ...meta.margins!, top: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Bottom</span>
            <input
              type="number"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={meta.margins?.bottom ?? 40}
              onChange={(e) =>
                setTemplateMeta({
                  margins: { ...meta.margins!, bottom: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Left</span>
            <input
              type="number"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={meta.margins?.left ?? 40}
              onChange={(e) =>
                setTemplateMeta({
                  margins: { ...meta.margins!, left: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Right</span>
            <input
              type="number"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={meta.margins?.right ?? 40}
              onChange={(e) =>
                setTemplateMeta({
                  margins: { ...meta.margins!, right: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
