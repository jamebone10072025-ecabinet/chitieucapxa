import React, { useState } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Calculator,
  ArrowUpDown,
  FileCheck,
} from "lucide-react";
import { TGTSPRow, CalculationMethod, CommuneProfile } from "../types";
import {
  calculateTGTSPRow,
  calculateProvincialCapAdjustment,
  calculateGrowthRate,
  calculateAverageAnnualGrowthRate,
  formatVND,
} from "../utils/calculations";

interface TGTSPModuleProps {
  commune: CommuneProfile;
  onUpdateCommune: (updated: CommuneProfile) => void;
}

export const TGTSPModule: React.FC<TGTSPModuleProps> = ({
  commune,
  onUpdateCommune,
}) => {
  const [editingRow, setEditingRow] = useState<TGTSPRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tính tổng TGTSP hiện hành và so sánh
  let totalCurrentPrice = 0;
  let totalConstantPrice = 0;

  (commune.tgtspRows || []).forEach((r) => {
    const calc = calculateTGTSPRow(r);
    totalCurrentPrice += calc.currentPriceValue;
    totalConstantPrice += calc.constantPriceValue;
  });

  // Tính kiểm tra trần tỉnh
  const capCheck = calculateProvincialCapAdjustment(
    totalCurrentPrice,
    commune.sumAllCommunesTGTSP,
    commune.provincialGTSX
  );

  // Giả định TGTSP năm trước (n-1) là 92% giá trị hiện tại để tính tăng trưởng
  const previousYearTGTSP = Math.round(totalConstantPrice * 0.925);
  const growthRateYearOnYear = calculateGrowthRate(
    totalConstantPrice,
    previousYearTGTSP
  );

  // Tốc độ tăng bình quân thời kỳ 2026-2030 (giả sử kỳ gốc 2025 là 85% và n=5)
  const baseYearTGTSP = Math.round(totalConstantPrice * 0.85);
  const avgPeriodGrowthRate = calculateAverageAnnualGrowthRate(
    totalConstantPrice,
    baseYearTGTSP,
    5
  );

  // Cơ cấu 3 nhóm ngành chính
  let agCurrent = 0;
  let indCurrent = 0;
  let servCurrent = 0;

  (commune.tgtspRows || []).forEach((r) => {
    const calc = calculateTGTSPRow(r);
    const code = r.industryCode.toUpperCase();
    if (code.startsWith("A")) {
      agCurrent += calc.currentPriceValue;
    } else if (
      code.startsWith("B") ||
      code.startsWith("C") ||
      code.startsWith("D") ||
      code.startsWith("F")
    ) {
      indCurrent += calc.currentPriceValue;
    } else {
      servCurrent += calc.currentPriceValue;
    }
  });

  const agPct = totalCurrentPrice > 0 ? (agCurrent / totalCurrentPrice) * 100 : 0;
  const indPct = totalCurrentPrice > 0 ? (indCurrent / totalCurrentPrice) * 100 : 0;
  const servPct = totalCurrentPrice > 0 ? (servCurrent / totalCurrentPrice) * 100 : 0;

  // Xóa một dòng
  const handleDeleteRow = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa chỉ tiêu này?")) {
      const updatedRows = commune.tgtspRows.filter((r) => r.id !== id);
      onUpdateCommune({ ...commune, tgtspRows: updatedRows });
    }
  };

  // Mở modal thêm mới
  const handleAddNew = () => {
    const newRow: TGTSPRow = {
      id: "row-" + Date.now(),
      industryCode: "A01",
      industryName: "",
      isDirect: true,
      method: "DIRECT_OUTPUT_PRICE",
      quantity: 100,
      unit: "Tấn",
      unitPrice: 10,
      priceIndex: 103.0,
      currentPriceValue: 1000,
      constantPriceValue: 970.87,
      notes: "Biên soạn theo QĐ 2545/QĐ-BTC",
    };
    setEditingRow(newRow);
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleEdit = (row: TGTSPRow) => {
    setEditingRow({ ...row });
    setIsModalOpen(true);
  };

  // Lưu dòng
  const handleSaveRow = (rowToSave: TGTSPRow) => {
    const calc = calculateTGTSPRow(rowToSave);
    const finalRow: TGTSPRow = {
      ...rowToSave,
      currentPriceValue: calc.currentPriceValue,
      constantPriceValue: calc.constantPriceValue,
    };

    const list = commune.tgtspRows || [];
    const exists = list.some((r) => r.id === finalRow.id);
    let updatedRows: TGTSPRow[];
    if (exists) {
      updatedRows = list.map((r) =>
        r.id === finalRow.id ? finalRow : r
      );
    } else {
      updatedRows = [...list, finalRow];
    }

    onUpdateCommune({ ...commune, tgtspRows: updatedRows });
    setIsModalOpen(false);
    setEditingRow(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200">
              PHỤ LỤC I - QUYẾT ĐỊNH 2545/QĐ-BTC
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-600" />
              Tổng giá trị sản phẩm trên địa bàn cấp xã (TGTSP)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Đo lường toàn bộ giá trị sản phẩm vật chất và dịch vụ do các đơn vị thường trú tại xã tạo ra trong năm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm ngành / chỉ tiêu mới</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">
              1. TGTSP giá hiện hành
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatVND(totalCurrentPrice, "triệu đ")}
            </span>
            <span className="text-xs text-slate-500">
              ≈ {formatVND(Math.round(totalCurrentPrice / 1000), "tỷ VNĐ")}
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">
              2. TGTSP giá so sánh
            </span>
            <span className="text-xl font-bold text-indigo-900 mt-1 block">
              {formatVND(totalConstantPrice, "triệu đ")}
            </span>
            <span className="text-xs text-indigo-600 font-medium">
              Theo hệ số chỉ số giá gốc của tỉnh
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">
              3. Tốc độ tăng trưởng năm
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-600">
                +{growthRateYearOnYear}%
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-500">
              Bình quân 2026-2030: +{avgPeriodGrowthRate}%/năm
            </span>
          </div>

          <div
            className={`rounded-lg p-3.5 border ${
              capCheck.isExceeded
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-emerald-50 border-emerald-300 text-emerald-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">
                4. Khống chế trần tỉnh
              </span>
              {capCheck.isExceeded ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="text-xs mt-1 font-medium">
              {capCheck.isExceeded ? (
                <div>
                  <span className="text-amber-800 font-bold block">
                    Cộng dồn vượt GTSX Tỉnh!
                  </span>
                  <span>Đã giảm trừ: -{formatVND(capCheck.communeReduction, "tr.đ")}</span>
                  <span className="block font-bold text-slate-900 mt-0.5">
                    Chuẩn: {formatVND(capCheck.finalAdjustedTGTSP, "tr.đ")}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-emerald-700 font-bold block">
                    Đạt chuẩn khống chế trần
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    $\sum$ các xã ({formatVND(commune.sumAllCommunesTGTSP / 1000, "tỷ")}) &le; Tỉnh ({formatVND(commune.provincialGTSX / 1000, "tỷ")})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sector Composition Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Cơ cấu kinh tế 3 nhóm ngành trên địa bàn xã:</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Nông lâm thủy sản: {agPct.toFixed(1)}% ({formatVND(agCurrent, "tr.đ")})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                Công nghiệp - Xây dựng: {indPct.toFixed(1)}% ({formatVND(indCurrent, "tr.đ")})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Dịch vụ & QLNN: {servPct.toFixed(1)}% ({formatVND(servCurrent, "tr.đ")})
              </span>
            </div>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${agPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-300"
              title={`Nông lâm thủy sản: ${agPct.toFixed(1)}%`}
            ></div>
            <div
              style={{ width: `${indPct}%` }}
              className="bg-blue-500 h-full transition-all duration-300"
              title={`Công nghiệp - Xây dựng: ${indPct.toFixed(1)}%`}
            ></div>
            <div
              style={{ width: `${servPct}%` }}
              className="bg-amber-500 h-full transition-all duration-300"
              title={`Dịch vụ & QLNN: ${servPct.toFixed(1)}%`}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Table of TGTSP */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Bảng tính chi tiết theo từng ngành kinh tế (giá hiện hành & so sánh)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Đơn vị tính: Triệu đồng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-16">Mã ngành</th>
                <th className="py-2.5 px-3">Tên ngành / Hoạt động kinh tế</th>
                <th className="py-2.5 px-3">Phương thức biên soạn</th>
                <th className="py-2.5 px-3">Thông tin tính toán đầu vào</th>
                <th className="py-2.5 px-3 text-right">Giá hiện hành</th>
                <th className="py-2.5 px-3 text-center">Chỉ số giá</th>
                <th className="py-2.5 px-3 text-right">Giá so sánh</th>
                <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {(commune.tgtspRows || []).map((row) => {
                const calc = calculateTGTSPRow(row);
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
                        {row.industryCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <div className="font-semibold text-slate-900">{row.industryName}</div>
                      {row.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {row.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.isDirect
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {row.isDirect ? "Tính trực tiếp" : "Tỉnh phân bổ"}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {row.method === "DIRECT_OUTPUT_PRICE" && "Sản lượng x Đơn giá"}
                        {row.method === "DIRECT_REVENUE_SUBSIDY" && "Doanh thu + Trợ cấp"}
                        {row.method === "DIRECT_TRADE_MARGIN" && "Doanh thu - Vốn hàng"}
                        {row.method === "DIRECT_COST_PROFIT" && "Chi phí + Lợi nhuận"}
                        {row.method === "STATE_MANAGEMENT" && "Chi NSNN QLNN"}
                        {row.method === "INDIRECT_ALLOCATED" && "Tỷ trọng phân bổ"}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {row.method === "DIRECT_OUTPUT_PRICE" && (
                        <div>
                          SL: {row.quantity?.toLocaleString("vi-VN")} {row.unit} &times; {row.unitPrice} tr.đ/{row.unit}
                        </div>
                      )}
                      {row.method === "DIRECT_REVENUE_SUBSIDY" && (
                        <div>DT thuần: {formatVND(row.revenue || 0)} tr.đ</div>
                      )}
                      {row.method === "DIRECT_TRADE_MARGIN" && (
                        <div>
                          DT: {formatVND(row.revenue || 0)} - Vốn: {formatVND(row.costOfGoodsSold || 0)}
                        </div>
                      )}
                      {row.method === "DIRECT_COST_PROFIT" && (
                        <div>
                          Chi phí: {formatVND(row.productionCost || 0)} + LN: {formatVND(row.netProfit || 0)}
                        </div>
                      )}
                      {row.method === "STATE_MANAGEMENT" && (
                        <div>
                          Chi NSNN: {formatVND(row.productionCost || 0)} + Ngoài: {formatVND(row.netProfit || 0)}
                        </div>
                      )}
                      {row.method === "INDIRECT_ALLOCATED" && (
                        <div>
                          Tỷ trọng {row.allocatedRatio}% của {formatVND(row.allocatedBaseProvincialValue || 0)} tr.đ
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatVND(calc.currentPriceValue)}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">
                      <span className="font-mono">{row.priceIndex}%</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-700">
                      {formatVND(calc.constantPriceValue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                          title="Sửa dòng"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600 transition"
                          title="Xóa dòng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right uppercase">
                  Tổng cộng TGTSP toàn xã:
                </td>
                <td className="py-3 px-3 text-right text-base text-amber-700 font-black">
                  {formatVND(totalCurrentPrice)}
                </td>
                <td className="py-3 px-3 text-center text-slate-500">-</td>
                <td className="py-3 px-3 text-right text-base text-indigo-800 font-black">
                  {formatVND(totalConstantPrice)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit TGTSP Row */}
      {isModalOpen && editingRow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingRow.id.startsWith("row-") ? "Thêm ngành / chỉ tiêu mới" : "Chỉnh sửa chỉ tiêu TGTSP"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã phân ngành:
                  </label>
                  <input
                    type="text"
                    value={editingRow.industryCode}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, industryCode: e.target.value })
                    }
                    placeholder="Ví dụ: A01, C, G..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên ngành / Hoạt động kinh tế:
                  </label>
                  <input
                    type="text"
                    value={editingRow.industryName}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, industryName: e.target.value })
                    }
                    placeholder="Ví dụ: Trồng lúa chất lượng cao, Gia công đồ gỗ..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình thức biên soạn:
                  </label>
                  <select
                    value={editingRow.isDirect ? "DIRECT" : "INDIRECT"}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        isDirect: e.target.value === "DIRECT",
                        method:
                          e.target.value === "DIRECT"
                            ? "DIRECT_OUTPUT_PRICE"
                            : "INDIRECT_ALLOCATED",
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    <option value="DIRECT">Tính trực tiếp tại xã (Mục 2.3)</option>
                    <option value="INDIRECT">Tỉnh phân bổ gián tiếp (Mục 2.4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Công thức phương pháp tính:
                  </label>
                  <select
                    value={editingRow.method}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        method: e.target.value as CalculationMethod,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    <option value="DIRECT_OUTPUT_PRICE">
                      (1) Sản lượng x Đơn giá bình quân (NLTS, khai khoáng...)
                    </option>
                    <option value="DIRECT_REVENUE_SUBSIDY">
                      (2) Doanh thu thuần + Trợ cấp sản phẩm (Công nghiệp, dịch vụ)
                    </option>
                    <option value="DIRECT_TRADE_MARGIN">
                      (3) Doanh thu - Giá vốn bán buôn/lẻ (Thương mại, ăn uống)
                    </option>
                    <option value="DIRECT_COST_PROFIT">
                      (4) Tổng chi phí + Lợi nhuận thuần + Trợ cấp (Xây dựng)
                    </option>
                    <option value="STATE_MANAGEMENT">
                      (5) Quản lý nhà nước: Chi thường xuyên NSNN trừ TSCĐ
                    </option>
                    <option value="INDIRECT_ALLOCATED">
                      (6) Phân bổ gián tiếp theo tỷ trọng từ GTSX của tỉnh
                    </option>
                  </select>
                </div>
              </div>

              {/* Dynamic inputs based on method */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Thông số đầu vào tính giá trị sản phẩm (triệu đồng):
                </span>

                {editingRow.method === "DIRECT_OUTPUT_PRICE" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Sản lượng:
                      </label>
                      <input
                        type="number"
                        value={editingRow.quantity || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Đơn vị tính:
                      </label>
                      <input
                        type="text"
                        value={editingRow.unit || "Tấn"}
                        onChange={(e) =>
                          setEditingRow({ ...editingRow, unit: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Đơn giá bình quân (Tr.đ):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRow.unitPrice || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {editingRow.method === "DIRECT_REVENUE_SUBSIDY" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Doanh thu thuần (Triệu đồng):
                      </label>
                      <input
                        type="number"
                        value={editingRow.revenue || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            revenue: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Trợ cấp sản phẩm (nếu có):
                      </label>
                      <input
                        type="number"
                        value={editingRow.subsidy || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            subsidy: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {editingRow.method === "DIRECT_TRADE_MARGIN" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Doanh thu thuần (Triệu đồng):
                      </label>
                      <input
                        type="number"
                        value={editingRow.revenue || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            revenue: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Trị giá vốn hàng bán / chuyển bán:
                      </label>
                      <input
                        type="number"
                        value={editingRow.costOfGoodsSold || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            costOfGoodsSold: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {editingRow.method === "DIRECT_COST_PROFIT" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Tổng chi phí sản xuất:
                      </label>
                      <input
                        type="number"
                        value={editingRow.productionCost || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            productionCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Lợi nhuận thuần:
                      </label>
                      <input
                        type="number"
                        value={editingRow.netProfit || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            netProfit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Trợ cấp (nếu có):
                      </label>
                      <input
                        type="number"
                        value={editingRow.subsidy || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            subsidy: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {editingRow.method === "STATE_MANAGEMENT" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Chi thường xuyên NSNN (đã trừ TSCĐ, trợ cấp):
                      </label>
                      <input
                        type="number"
                        value={editingRow.productionCost || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            productionCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Kinh phí ngoài NSNN (nếu có):
                      </label>
                      <input
                        type="number"
                        value={editingRow.netProfit || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            netProfit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                {editingRow.method === "INDIRECT_ALLOCATED" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Tỷ trọng phân bổ của xã (%):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRow.allocatedRatio || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            allocatedRatio: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        GTSX gốc toàn tỉnh cần phân bổ (Tr.đ):
                      </label>
                      <input
                        type="number"
                        value={editingRow.allocatedBaseProvincialValue || 0}
                        onChange={(e) =>
                          setEditingRow({
                            ...editingRow,
                            allocatedBaseProvincialValue:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Chỉ số giá tương ứng so kỳ gốc (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingRow.priceIndex || 100}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          priceIndex: parseFloat(e.target.value) || 100,
                        })
                      }
                      className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ghi chú nguồn dữ liệu:
                    </label>
                    <input
                      type="text"
                      value={editingRow.notes || ""}
                      onChange={(e) =>
                        setEditingRow({ ...editingRow, notes: e.target.value })
                      }
                      placeholder="Ví dụ: Khai thác Biểu 010.N, Điều tra cá thể..."
                      className="w-full px-2.5 py-1.5 border rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preview calculation in modal */}
              {(() => {
                const preview = calculateTGTSPRow(editingRow);
                return (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-950 block">
                        Kết quả tự động tính:
                      </span>
                      <span className="text-slate-600">
                        Giá hiện hành:{" "}
                        <strong className="text-slate-900">
                          {formatVND(preview.currentPriceValue, "triệu đồng")}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">
                        Giá so sánh:{" "}
                        <strong className="text-indigo-800">
                          {formatVND(preview.constantPriceValue, "triệu đồng")}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveRow(editingRow)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Lưu chỉ tiêu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
