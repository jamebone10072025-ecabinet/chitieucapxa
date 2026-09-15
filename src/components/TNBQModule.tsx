import React, { useState } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Calculator,
  Award,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  CommuneProfile,
  HouseholdSurveyRecord,
  HouseholdMember,
} from "../types";
import {
  calculateHouseholdIncomeBreakdown,
  calculateCommuneTNBQ,
  formatVND,
} from "../utils/calculations";
import { HouseholdSurveyModal } from "./HouseholdSurveyModal";
import { AISurveyScannerModal } from "./AISurveyScannerModal";

interface TNBQModuleProps {
  commune: CommuneProfile;
  onUpdateCommune: (updated: CommuneProfile) => void;
}

export const TNBQModule: React.FC<TNBQModuleProps> = ({
  commune,
  onUpdateCommune,
}) => {
  const [selectedSurvey, setSelectedSurvey] = useState<HouseholdSurveyRecord | null>(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVillage, setFilterVillage] = useState("ALL");
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  // Thông số quyền số điều tra mẫu suy rộng W_ci
  const [sampleWeights, setSampleWeights] = useState({
    Nc: commune.totalHouseholds, // Tổng số hộ của xã
    mc: 3, // Số ĐBĐT được chọn của xã
    Mci: 280, // Số hộ của ĐBĐT i tại 2025
    M_prime_ci: 295, // Số hộ sau khi cập nhật bảng kê
    nci: commune.surveys.length || 15, // Số hộ điều tra thực tế
  });

  // Công thức Wci = (Nc / (Mci * mc)) * (M'_ci / nci)
  const calculatedWci =
    sampleWeights.Mci * sampleWeights.mc * sampleWeights.nci > 0
      ? (sampleWeights.Nc / (sampleWeights.Mci * sampleWeights.mc)) *
        (sampleWeights.M_prime_ci / sampleWeights.nci)
      : 1;

  // Tính các chỉ số TNBQ cấp xã
  const stats = calculateCommuneTNBQ(commune);

  // Tiêu chí thu nhập nông thôn mới chuẩn 2026: >= 68 triệu đồng/người/năm (NTM nâng cao)
  const isNTMStandardMet = stats.averagePerCapitaAnnualMillionVND >= 68.0;

  // Danh sách các thôn/xóm có trong mẫu
  const villages = Array.from(
    new Set((commune.surveys || []).map((s) => s.villageName || "Chưa phân thôn"))
  );

  // Lọc danh sách hộ
  const filteredSurveys = (commune.surveys || []).filter((s) => {
    const matchSearch =
      s.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVillage =
      filterVillage === "ALL" || s.villageName === filterVillage;
    return matchSearch && matchVillage;
  });

  // Mở modal tạo mới phiếu khảo sát CAPI
  const handleAddNewSurvey = () => {
    const surveysList = commune.surveys || [];
    const newSurvey: HouseholdSurveyRecord = {
      id: "sv-" + Date.now(),
      code: `H-${String(surveysList.length + 1).padStart(3, "0")}`,
      headName: "",
      address: "Thôn...",
      villageName: (villages[0] as string) || "Thôn 1",
      phoneNumber: "",
      members: [
        {
          id: "m-" + Date.now(),
          fullName: "",
          gender: "Nam",
          birthYear: 1980,
          relationship: "Chủ hộ",
          monthsLivedInPast12Months: 12,
          specialCaseRule: "NONE",
          isCountedAsMember: true,
        },
      ],
      salaryItems: [],
      cropItems: [],
      livestockItems: [],
      forestryItems: [],
      fisheryItems: [],
      nonFarmItems: [],
      otherIncomeItems: [],
      hasExcludedCapitalTransaction: true,
      verificationNotes: "Phiếu phỏng vấn CAPI theo QĐ 2545",
      isVerified: false,
    };
    setSelectedSurvey(newSurvey);
    setIsSurveyModalOpen(true);
  };

  // Mở sửa phiếu
  const handleEditSurvey = (survey: HouseholdSurveyRecord) => {
    setSelectedSurvey({ ...survey });
    setIsSurveyModalOpen(true);
  };

  // Xóa phiếu
  const handleDeleteSurvey = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiếu điều tra của hộ này?")) {
      const updated = (commune.surveys || []).filter((s) => s.id !== id);
      onUpdateCommune({ ...commune, surveys: updated });
    }
  };

  // Lưu phiếu từ modal
  const handleSaveSurvey = (savedSurvey: HouseholdSurveyRecord) => {
    const list = commune.surveys || [];
    const exists = list.some((s) => s.id === savedSurvey.id);
    let updated: HouseholdSurveyRecord[];
    if (exists) {
      updated = list.map((s) =>
        s.id === savedSurvey.id ? savedSurvey : s
      );
    } else {
      updated = [...list, savedSurvey];
    }
    onUpdateCommune({ ...commune, surveys: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
              PHỤ LỤC II - QUYẾT ĐỊNH 2545/QĐ-BTC
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              Thu nhập bình quân đầu người trên địa bàn cấp xã (TNBQ)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Phỏng vấn điều tra mẫu hộ gia đình qua phiếu điện tử CAPI (7 mục thu nhập và kiểm tra ngoại lệ nhân khẩu).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWeightModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-lg text-xs border border-slate-300 transition cursor-pointer"
              title="Xem và hiệu chỉnh quyền số suy rộng Wci"
            >
              <Scale className="w-4 h-4 text-slate-600" />
              <span>Quyền số mẫu (W_ci = {calculatedWci.toFixed(2)})</span>
            </button>

            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold px-3.5 py-2 rounded-lg text-xs transition shadow-xs cursor-pointer"
              title="Quét ảnh chụp phiếu điều tra giấy hoặc dán ghi chép phỏng vấn để AI tự động trích xuất"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Smart Scanner (Quét ảnh / Nhập nhanh)</span>
            </button>

            <button
              onClick={handleAddNewSurvey}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Phỏng vấn hộ mới (CAPI)</span>
            </button>
          </div>
        </div>

        {/* 4 Key Stat Cards for TNBQ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">
              1. TNBQ đầu người / năm
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {stats.averagePerCapitaAnnualMillionVND.toFixed(2)} tr.đ
            </span>
            <span className="text-xs text-slate-500">
              ≈ {formatVND(stats.averagePerCapitaAnnualThousandVND)} nghìn đồng/người/năm
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">
              2. TNBQ đầu người / tháng
            </span>
            <span className="text-2xl font-black text-indigo-700 mt-1 block">
              {formatVND(stats.averagePerCapitaMonthlyThousandVND)}
            </span>
            <span className="text-xs text-slate-500">
              Nghìn đồng / người / tháng
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">
              3. Quy mô điều tra mẫu
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">
                {stats.sampleHouseholdsCount} hộ
              </span>
              <span className="text-xs font-medium text-slate-600">
                ({stats.samplePopulationCount} nhân khẩu)
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Tổng số hộ toàn xã: {commune.totalHouseholds.toLocaleString()} hộ
            </span>
          </div>

          <div
            className={`rounded-lg p-3.5 border ${
              isNTMStandardMet
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">
                4. Tiêu chí nông thôn mới
              </span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs mt-1 font-medium">
              {isNTMStandardMet ? (
                <div>
                  <span className="text-emerald-800 font-bold block">
                    ĐẠT Tiêu chí NTM Nâng cao
                  </span>
                  <span className="text-emerald-700">
                    Mức đạt: {stats.averagePerCapitaAnnualMillionVND.toFixed(2)} tr.đ &ge; 68 tr.đ
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-amber-800 font-bold block">
                    Đạt NTM Cơ bản
                  </span>
                  <span className="text-amber-700">
                    Cần đạt &ge; 68 tr.đ để đạt NTM Nâng cao
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List & Filters */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Danh sách phiếu thu thập thông tin hộ dân cư ({filteredSurveys.length} phiếu)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm chủ hộ, mã hộ, thôn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-48"
              />
            </div>

            {/* Filter by Village */}
            <select
              value={filterVillage}
              onChange={(e) => setFilterVillage(e.target.value)}
              className="bg-white text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Tất cả thôn/xóm</option>
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-16">Mã hộ</th>
                <th className="py-2.5 px-3">Họ và tên chủ hộ</th>
                <th className="py-2.5 px-3">Địa chỉ / Thôn</th>
                <th className="py-2.5 px-3 text-center">Số nhân khẩu</th>
                <th className="py-2.5 px-3 text-right">Tổng thu nhập thuần</th>
                <th className="py-2.5 px-3 text-right">TNBQ/người/năm</th>
                <th className="py-2.5 px-3 text-center">Trạng thái CAPI</th>
                <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Chưa có phiếu điều tra nào phù hợp với bộ lọc. Bấm "Phỏng Vấn Hộ Mới (CAPI)" để bắt đầu.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => {
                  const income = calculateHouseholdIncomeBreakdown(survey);
                  return (
                    <tr key={survey.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
                          {survey.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {survey.headName || "Chưa đặt tên"}
                        {survey.phoneNumber && (
                          <span className="text-[10px] text-slate-500 block font-normal">
                            SĐT: {survey.phoneNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{survey.address}</div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {survey.villageName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {income.validMembersCount} người
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (tổng {survey.members.length})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatVND(income.totalNetIncome, "nghìn đ")}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        {formatVND(income.perCapitaAnnual, "nghìn đ")}
                        <span className="text-[10px] text-slate-500 block font-normal">
                          ≈ {(income.perCapitaAnnual / 1000).toFixed(1)} tr.đ/năm
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {survey.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã nghiệm thu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Chờ kiểm tra
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditSurvey(survey)}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
                            title="Mở phiếu CAPI và xem chi tiết 7 mục"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition"
                            title="Xóa phiếu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredSurveys.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-right uppercase">
                    Bình Quân Mẫu Toàn Xã:
                  </td>
                  <td className="py-3 px-3 text-center text-slate-800">
                    {stats.samplePopulationCount} người
                  </td>
                  <td className="py-3 px-3 text-right text-slate-900">
                    {formatVND(stats.sampleTotalIncomeThousandVND, "nghìn đ")}
                  </td>
                  <td className="py-3 px-3 text-right text-base text-emerald-800 font-black">
                    {formatVND(stats.averagePerCapitaAnnualThousandVND, "nghìn đ")}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Calculation of Weight Wci */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>Quyền Số Thiết Kế Mẫu Điều Tra Suy Rộng ($W_{`ci`}$)</span>
              </div>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-indigo-950 font-mono text-center text-sm font-bold">
                W_ci = [ N_c / (M_ci * m_c) ] * [ M&apos;_ci / n_ci ]
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    N_c (Tổng số hộ toàn xã):
                  </label>
                  <input
                    type="number"
                    value={sampleWeights.Nc}
                    onChange={(e) =>
                      setSampleWeights({
                        ...sampleWeights,
                        Nc: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    m_c (Số ĐBĐT mẫu của xã):
                  </label>
                  <input
                    type="number"
                    value={sampleWeights.mc}
                    onChange={(e) =>
                      setSampleWeights({
                        ...sampleWeights,
                        mc: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-2 py-1 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    M_ci (Số hộ ĐBĐT năm 2025):
                  </label>
                  <input
                    type="number"
                    value={sampleWeights.Mci}
                    onChange={(e) =>
                      setSampleWeights({
                        ...sampleWeights,
                        Mci: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-2 py-1 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    M&apos;_ci (Số hộ sau cập nhật):
                  </label>
                  <input
                    type="number"
                    value={sampleWeights.M_prime_ci}
                    onChange={(e) =>
                      setSampleWeights({
                        ...sampleWeights,
                        M_prime_ci: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-2 py-1 border rounded bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">
                    n_ci (Số hộ điều tra thực tế):
                  </label>
                  <input
                    type="number"
                    value={sampleWeights.nci}
                    onChange={(e) =>
                      setSampleWeights({
                        ...sampleWeights,
                        nci: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-2 py-1 border rounded bg-white"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-600 block">Quyền số suy rộng tính được:</span>
                <span className="text-xl font-bold text-emerald-700">
                  Wci = {calculatedWci.toFixed(4)}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mỗi hộ mẫu đại diện cho khoảng {Math.round(calculatedWci)} hộ dân trong xã.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Household Survey Modal */}
      {selectedSurvey && (
        <HouseholdSurveyModal
          survey={selectedSurvey}
          isOpen={isSurveyModalOpen}
          onClose={() => {
            setIsSurveyModalOpen(false);
            setSelectedSurvey(null);
          }}
          onSave={handleSaveSurvey}
        />
      )}

      {/* AI Smart Scanner Modal */}
      <AISurveyScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        commune={commune}
        onApplySurvey={(extracted) => {
          setSelectedSurvey(extracted);
          setIsSurveyModalOpen(true);
        }}
      />
    </div>
  );
};
