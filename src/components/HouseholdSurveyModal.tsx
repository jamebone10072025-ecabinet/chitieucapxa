import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  HelpCircle,
  Calculator,
  Save,
  ShieldCheck,
  Wheat,
  PiggyBank,
  TreePine,
  Fish,
  Briefcase,
  Gift,
} from "lucide-react";
import {
  HouseholdSurveyRecord,
  HouseholdMember,
  SalaryIncomeItem,
  CropIncomeItem,
  LivestockIncomeItem,
  ForestryIncomeItem,
  FisheryIncomeItem,
  NonFarmBusinessIncomeItem,
  OtherIncomeItem,
} from "../types";
import {
  evaluateHouseholdMember,
  calculateHouseholdIncomeBreakdown,
  formatVND,
} from "../utils/calculations";
import {
  CROPS_CATALOG,
  LIVESTOCK_CATALOG,
  FORESTRY_CATALOG,
  INCLUSION_RULES,
  EXCLUSION_RULES,
  EXCLUDED_CAPITAL_TRANSACTIONS,
} from "../data/referenceTables";

interface HouseholdSurveyModalProps {
  survey: HouseholdSurveyRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedSurvey: HouseholdSurveyRecord) => void;
}

export const HouseholdSurveyModal: React.FC<HouseholdSurveyModalProps> = ({
  survey,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !survey) return null;

  const [activeTab, setActiveTab] = useState<
    "members" | "sec1" | "sec2" | "sec3" | "sec4" | "sec5" | "sec6" | "sec7" | "summary"
  >("members");

  const [formData, setFormData] = useState<HouseholdSurveyRecord>({ ...survey });

  // Tính toán kết quả thu nhập hộ
  const incomeBreakdown = calculateHouseholdIncomeBreakdown(formData);

  // Thêm thành viên
  const handleAddMember = () => {
    const newMember: HouseholdMember = {
      id: "m-" + Date.now(),
      fullName: "",
      gender: "Nam",
      birthYear: 1990,
      relationship: "Con",
      monthsLivedInPast12Months: 12,
      specialCaseRule: "NONE",
      isCountedAsMember: true,
    };
    setFormData({
      ...formData,
      members: [...formData.members, newMember],
    });
  };

  // Cập nhật thành viên
  const handleUpdateMember = (index: number, updated: HouseholdMember) => {
    const evalRes = evaluateHouseholdMember(updated);
    const newMembers = [...formData.members];
    newMembers[index] = { ...updated, isCountedAsMember: evalRes.isCounted };
    setFormData({ ...formData, members: newMembers });
  };

  // Xóa thành viên
  const handleDeleteMember = (id: string) => {
    setFormData({
      ...formData,
      members: formData.members.filter((m) => m.id !== id),
    });
  };

  // Thêm khoản lương Mục 1
  const handleAddSalaryItem = () => {
    const item: SalaryIncomeItem = {
      id: "sal-" + Date.now(),
      memberId: formData.members[0]?.id || "",
      fullName: formData.members[0]?.fullName || "Thành viên",
      jobDescription: "",
      salaryAndAllowances: 0,
      pensionAndSeverance: 0,
      socialAssistance: 0,
    };
    setFormData({ ...formData, salaryItems: [...formData.salaryItems, item] });
  };

  // Thêm cây trồng Mục 2
  const handleAddCropItem = () => {
    const item: CropIncomeItem = {
      id: "crop-" + Date.now(),
      cropName: CROPS_CATALOG[0],
      cropCategory: "CÂY_HÀNG_NĂM",
      harvestValueSold: 0,
      harvestValueSelfUsed: 0,
      seedCost: 0,
      fertilizerPesticideCost: 0,
      otherCost: 0,
    };
    setFormData({ ...formData, cropItems: [...formData.cropItems, item] });
  };

  // Thêm vật nuôi Mục 3
  const handleAddLivestockItem = () => {
    const item: LivestockIncomeItem = {
      id: "ls-" + Date.now(),
      livestockName: LIVESTOCK_CATALOG[0],
      category: "GIA_SÚC",
      valueSold: 0,
      valueSelfUsed: 0,
      breedCost: 0,
      feedAndMedicineCost: 0,
      otherCost: 0,
    };
    setFormData({ ...formData, livestockItems: [...formData.livestockItems, item] });
  };

  // Thêm lâm nghiệp Mục 4
  const handleAddForestryItem = () => {
    const item: ForestryIncomeItem = {
      id: "for-" + Date.now(),
      forestryName: FORESTRY_CATALOG[0],
      harvestValueSold: 0,
      harvestValueSelfUsed: 0,
      breedCost: 0,
      fertilizerCost: 0,
      otherCost: 0,
    };
    setFormData({ ...formData, forestryItems: [...formData.forestryItems, item] });
  };

  // Thêm thủy sản Mục 5
  const handleAddFisheryItem = () => {
    const item: FisheryIncomeItem = {
      id: "fish-" + Date.now(),
      fisheryName: "Cá ao hồ nước ngọt",
      type: "NUÔI_TRỒNG",
      harvestValueSold: 0,
      harvestValueSelfUsed: 0,
      breedCost: 0,
      feedAndMedicineCost: 0,
      otherCost: 0,
    };
    setFormData({ ...formData, fisheryItems: [...formData.fisheryItems, item] });
  };

  // Thêm phi nông Mục 6
  const handleAddNonFarmItem = () => {
    const item: NonFarmBusinessIncomeItem = {
      id: "nf-" + Date.now(),
      activityName: "Bán lẻ hàng tạp hóa, dịch vụ cơ khí, làm bún bánh...",
      valueSold: 0,
      valueSelfUsed: 0,
      materialCost: 0,
      energyCost: 0,
      otherCost: 0,
    };
    setFormData({ ...formData, nonFarmItems: [...formData.nonFarmItems, item] });
  };

  // Thêm thu khác Mục 7
  const handleAddOtherItem = () => {
    const item: OtherIncomeItem = {
      id: "oth-" + Date.now(),
      category: "EXTERNAL_SUPPORT",
      description: "Tiền quà biếu, mừng cưới, phúng viếng...",
      amount: 0,
    };
    setFormData({ ...formData, otherIncomeItems: [...formData.otherIncomeItems, item] });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                PHIẾU ĐIỀU TRA CAPI
              </span>
              <h3 className="font-bold text-base text-white">
                Phiếu thu thập thông tin thu nhập hộ gia đình - {formData.headName || "Mới"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Áp dụng mẫu biểu Phụ lục II - Quyết định số 2545/QĐ-BTC Bộ Tài chính
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase block">Thu nhập BQ/người</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatVND(incomeBreakdown.perCapitaAnnual, "nghìn đ/năm")}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold p-1 cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Identification strip */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-0.5">Mã hộ điều tra:</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full bg-white px-2 py-1 border rounded text-xs font-mono font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-0.5">Họ và tên chủ hộ:</label>
            <input
              type="text"
              value={formData.headName}
              onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
              className="w-full bg-white px-2 py-1 border rounded text-xs font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-0.5">Thôn / Xóm / Bản:</label>
            <input
              type="text"
              value={formData.villageName}
              onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
              className="w-full bg-white px-2 py-1 border rounded text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-0.5">Số điện thoại liên hệ:</label>
            <input
              type="text"
              value={formData.phoneNumber || ""}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full bg-white px-2 py-1 border rounded text-xs"
            />
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 flex items-center gap-1 overflow-x-auto text-xs font-medium py-2">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "members"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Nhân khẩu ({incomeBreakdown.validMembersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("sec1")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec1"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Mục 1: Tiền lương</span>
            {incomeBreakdown.section1_salary > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("sec2")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec2"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Wheat className="w-3.5 h-3.5" />
            <span>Mục 2: Trồng trọt</span>
          </button>

          <button
            onClick={() => setActiveTab("sec3")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec3"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Mục 3: Chăn nuôi</span>
          </button>

          <button
            onClick={() => setActiveTab("sec4")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec4"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>Mục 4: Lâm nghiệp</span>
          </button>

          <button
            onClick={() => setActiveTab("sec5")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec5"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Fish className="w-3.5 h-3.5" />
            <span>Mục 5: Thủy sản</span>
          </button>

          <button
            onClick={() => setActiveTab("sec6")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec6"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Mục 6: Phi nông</span>
          </button>

          <button
            onClick={() => setActiveTab("sec7")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sec7"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Mục 7: Thu khác</span>
          </button>

          <button
            onClick={() => setActiveTab("summary")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer font-bold ${
              activeTab === "summary"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tổng hợp thu nhập</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 0: MEMBERS & RULES CHECK */}
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Quy tắc xác định nhân khẩu tính thu nhập cấp xã (Mục II.4 - QĐ 2545):
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Thành viên hộ là người cùng ăn, ở chung từ 6 tháng trở lên và có chung quỹ thu chi.
                  Hệ thống tự động hỗ trợ <strong>5 trường hợp ngoại lệ được tính</strong> (chủ hộ vắng mặt, trẻ &lt;6 tháng, người mới nhập hộ, sinh viên/bệnh viện nuôi trọn, khách &gt;6 tháng nuôi trọn)
                  và <strong>2 trường hợp loại trừ</strong> (người giúp việc có quỹ riêng, người chết/đã chuyển đi vĩnh viễn).
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">
                  Danh sách thành viên thực tế của hộ ({formData.members.length} người)
                </h4>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thành viên</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.members.map((member, idx) => {
                  const evalRes = evaluateHouseholdMember(member);
                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg border transition ${
                        evalRes.isCounted
                          ? "bg-white border-slate-200"
                          : "bg-red-50/50 border-red-200"
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Họ và tên:
                          </label>
                          <input
                            type="text"
                            value={member.fullName}
                            onChange={(e) =>
                              handleUpdateMember(idx, {
                                ...member,
                                fullName: e.target.value,
                              })
                            }
                            placeholder="Nhập tên thành viên..."
                            className="w-full px-2 py-1 border rounded font-semibold text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Quan hệ:
                          </label>
                          <select
                            value={member.relationship}
                            onChange={(e) =>
                              handleUpdateMember(idx, {
                                ...member,
                                relationship: e.target.value as any,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="Chủ hộ">Chủ hộ</option>
                            <option value="Vợ/Chồng">Vợ/Chồng</option>
                            <option value="Con">Con</option>
                            <option value="Cha/Mẹ">Cha/Mẹ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Tháng ở 12th qua:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="12"
                            value={member.monthsLivedInPast12Months}
                            onChange={(e) =>
                              handleUpdateMember(idx, {
                                ...member,
                                monthsLivedInPast12Months:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-xs font-mono text-center"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Quy tắc ngoại lệ đặc thù:
                          </label>
                          <select
                            value={member.specialCaseRule || "NONE"}
                            onChange={(e) =>
                              handleUpdateMember(idx, {
                                ...member,
                                specialCaseRule: e.target.value as any,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-[11px]"
                          >
                            <option value="NONE">Chuẩn bình thường (theo số tháng ở)</option>
                            <option value="RULE_1_HEAD_ABSENT">
                              Ngoại lệ 1: Chủ hộ đi làm xa &gt;6 tháng nhưng chu cấp
                            </option>
                            <option value="RULE_2_NEWBORN">
                              Ngoại lệ 2: Trẻ sơ sinh chưa đủ 6 tháng tuổi
                            </option>
                            <option value="RULE_3_NEW_PERMANENT">
                              Ngoại lệ 3: Con dâu/rể mới, xuất ngũ, nghỉ hưu về ở lâu dài
                            </option>
                            <option value="RULE_4_STUDENT_PATIENT">
                              Ngoại lệ 4: Học sinh, sinh viên, nằm viện xa nhà hộ nuôi trọn
                            </option>
                            <option value="RULE_5_LONG_GUEST">
                              Ngoại lệ 5: Khách/họ hàng ở &gt;6 tháng được hộ nuôi trọn
                            </option>
                            <option value="EXCLUDED_MAID">
                              LOẠI TRỪ 1: Người giúp việc có gia đình/quỹ riêng
                            </option>
                            <option value="EXCLUDED_DECEASED_LEFT">
                              LOẠI TRỪ 2: Đã chuyển đi vĩnh viễn hoặc đã chết
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Status row */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {evalRes.isCounted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              HỢP LỆ tính nhân khẩu TNBQ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <AlertCircle className="w-3 h-3" />
                              LOẠI TRỪ khỏi nhân khẩu TNBQ
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {evalRes.reason}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1: MỤC 1 - LƯƠNG, TIỀN CÔNG */}
          {activeTab === "sec1" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 1: Thu nhập từ tiền lương, tiền công & trợ cấp thường xuyên
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Đơn vị tính: 1.000 VNĐ (nghìn đồng) trong 12 tháng qua
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSalaryItem}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thu nhập người làm công</span>
                </button>
              </div>

              {formData.salaryItems.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
                  Hộ không có thành viên hưởng lương, tiền công hoặc chưa nhập liệu. Bấm "Thêm thu nhập người làm công" để nhập.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.salaryItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Họ tên người hưởng:
                          </label>
                          <input
                            type="text"
                            value={item.fullName}
                            onChange={(e) => {
                              const list = [...formData.salaryItems];
                              list[idx].fullName = e.target.value;
                              setFormData({ ...formData, salaryItems: list });
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Mô tả công việc:
                          </label>
                          <input
                            type="text"
                            value={item.jobDescription}
                            onChange={(e) => {
                              const list = [...formData.salaryItems];
                              list[idx].jobDescription = e.target.value;
                              setFormData({ ...formData, salaryItems: list });
                            }}
                            placeholder="Công nhân may, giáo viên, thợ hàn..."
                            className="w-full px-2 py-1 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block">
                            Cột 1: Lương, phụ cấp, thưởng:
                          </label>
                          <input
                            type="number"
                            value={item.salaryAndAllowances}
                            onChange={(e) => {
                              const list = [...formData.salaryItems];
                              list[idx].salaryAndAllowances = parseFloat(e.target.value) || 0;
                              setFormData({ ...formData, salaryItems: list });
                            }}
                            className="w-full px-2 py-1 border rounded font-mono font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 font-bold block">
                              Cột 2+3: Hưu trí/Trợ cấp TX:
                            </label>
                            <input
                              type="number"
                              value={item.pensionAndSeverance + item.socialAssistance}
                              onChange={(e) => {
                                const list = [...formData.salaryItems];
                                list[idx].pensionAndSeverance = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, salaryItems: list });
                              }}
                              className="w-full px-2 py-1 border rounded font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                salaryItems: formData.salaryItems.filter((s) => s.id !== item.id),
                              });
                            }}
                            className="text-red-500 hover:text-red-700 mt-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MỤC 2 - TRỒNG TRỌT */}
          {activeTab === "sec2" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 2: Thu nhập từ hoạt động trồng trọt
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Thu nhập = Tổng thu (Bán + Tự dùng) - Chi phí (Giống + Phân bón, BVTV + Chi khác). Đơn vị: 1.000 VNĐ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCropItem}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm cây trồng</span>
                </button>
              </div>

              {formData.cropItems.map((crop, idx) => {
                const totalHarvest = crop.harvestValueSold + crop.harvestValueSelfUsed;
                const totalCost = crop.seedCost + crop.fertilizerPesticideCost + crop.otherCost;
                const netIncome = totalHarvest - totalCost;

                return (
                  <div key={crop.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={crop.cropName}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].cropName = e.target.value;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="px-2 py-1 border rounded font-bold text-xs"
                        >
                          {CROPS_CATALOG.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={crop.cropCategory}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].cropCategory = e.target.value as any;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          <option value="CÂY_HÀNG_NĂM">Cây hàng năm (Lúa, ngô, rau...)</option>
                          <option value="CÂY_LÂU_NĂM">Cây lâu năm (Chè, cà phê, cao su...)</option>
                          <option value="CÂY_ĂN_QUẢ">Cây ăn quả (Cam, bưởi, chuối...)</option>
                          <option value="PHỤ_PHẨM">Sản phẩm phụ (Rơm rạ, ngô sắn...)</option>
                          <option value="DỊCH_VỤ">Dịch vụ trồng trọt (Làm đất, gặt...)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-700">
                          Thu nhập thuần: {formatVND(netIncome)} nghìn đ
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              cropItems: formData.cropItems.filter((c) => c.id !== crop.id),
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 1: Bán/cho/biếu</label>
                        <input
                          type="number"
                          value={crop.harvestValueSold}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].harvestValueSold = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 2: Tự dùng/tồn</label>
                        <input
                          type="number"
                          value={crop.harvestValueSelfUsed}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].harvestValueSelfUsed = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 4: Tiền giống</label>
                        <input
                          type="number"
                          value={crop.seedCost}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].seedCost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 5: Phân/thuốc BVTV</label>
                        <input
                          type="number"
                          value={crop.fertilizerPesticideCost}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].fertilizerPesticideCost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 6: Chi khác (xăng/máy)</label>
                        <input
                          type="number"
                          value={crop.otherCost}
                          onChange={(e) => {
                            const list = [...formData.cropItems];
                            list[idx].otherCost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, cropItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MỤC 3 - CHĂN NUÔI */}
          {activeTab === "sec3" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 3: Thu nhập từ hoạt động chăn nuôi
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Lưu ý: Không tính chi phí của đàn gia súc dở dang chưa xuất chuồng. Đơn vị: 1.000 VNĐ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLivestockItem}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm vật nuôi</span>
                </button>
              </div>

              {formData.livestockItems.map((ls, idx) => {
                const totalHarvest = ls.valueSold + ls.valueSelfUsed;
                const totalCost = ls.breedCost + ls.feedAndMedicineCost + ls.otherCost;
                const netIncome = totalHarvest - totalCost;

                return (
                  <div key={ls.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={ls.livestockName}
                          onChange={(e) => {
                            const list = [...formData.livestockItems];
                            list[idx].livestockName = e.target.value;
                            setFormData({ ...formData, livestockItems: list });
                          }}
                          className="px-2 py-1 border rounded font-bold text-xs"
                        >
                          {LIVESTOCK_CATALOG.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-700">
                          Thu nhập thuần: {formatVND(netIncome)} nghìn đ
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              livestockItems: formData.livestockItems.filter((item) => item.id !== ls.id),
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 1: Bán/giết thịt</label>
                        <input
                          type="number"
                          value={ls.valueSold}
                          onChange={(e) => {
                            const list = [...formData.livestockItems];
                            list[idx].valueSold = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, livestockItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 2: Tự dùng</label>
                        <input
                          type="number"
                          value={ls.valueSelfUsed}
                          onChange={(e) => {
                            const list = [...formData.livestockItems];
                            list[idx].valueSelfUsed = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, livestockItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 4: Con giống</label>
                        <input
                          type="number"
                          value={ls.breedCost}
                          onChange={(e) => {
                            const list = [...formData.livestockItems];
                            list[idx].breedCost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, livestockItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 5: Thức ăn/thuốc</label>
                        <input
                          type="number"
                          value={ls.feedAndMedicineCost}
                          onChange={(e) => {
                            const list = [...formData.livestockItems];
                            list[idx].feedAndMedicineCost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, livestockItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Cột 6: Chi khác</label>
                        <input
                          type="number"
                          value={ls.otherCost}
                          onChange={(e) => {
                            const list = [...formData.livestockItems];
                            list[idx].otherCost = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, livestockItems: list });
                          }}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: MỤC 4 - LÂM NGHIỆP */}
          {activeTab === "sec4" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 4: Thu nhập từ lâm nghiệp
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Khai thác gỗ, củi, măng nấm, ươm giống, bảo vệ rừng. Đơn vị: 1.000 VNĐ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddForestryItem}
                  className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm lâm sản/dịch vụ rừng</span>
                </button>
              </div>

              {formData.forestryItems.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
                  Hộ không phát sinh thu nhập lâm nghiệp.
                </div>
              ) : (
                formData.forestryItems.map((forItem, idx) => (
                  <div key={forItem.id} className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-5 gap-2 items-center">
                    <div className="col-span-2">
                      <select
                        value={forItem.forestryName}
                        onChange={(e) => {
                          const list = [...formData.forestryItems];
                          list[idx].forestryName = e.target.value;
                          setFormData({ ...formData, forestryItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded font-bold"
                      >
                        {FORESTRY_CATALOG.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Tổng thu:</label>
                      <input
                        type="number"
                        value={forItem.harvestValueSold + forItem.harvestValueSelfUsed}
                        onChange={(e) => {
                          const list = [...formData.forestryItems];
                          list[idx].harvestValueSold = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, forestryItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Tổng chi phí:</label>
                      <input
                        type="number"
                        value={forItem.breedCost + forItem.fertilizerCost + forItem.otherCost}
                        onChange={(e) => {
                          const list = [...formData.forestryItems];
                          list[idx].otherCost = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, forestryItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700">
                        Net: {formatVND(forItem.harvestValueSold - forItem.otherCost)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            forestryItems: formData.forestryItems.filter((f) => f.id !== forItem.id),
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: MỤC 5 - THỦY SẢN */}
          {activeTab === "sec5" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 5: Thu nhập từ nuôi trồng & đánh bắt thủy sản
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Cá ao hồ, tôm nước lợ/mặn, đánh bắt tự nhiên. Đơn vị: 1.000 VNĐ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFisheryItem}
                  className="bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thủy sản</span>
                </button>
              </div>

              {formData.fisheryItems.map((fish, idx) => (
                <div key={fish.id} className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={fish.fisheryName}
                      onChange={(e) => {
                        const list = [...formData.fisheryItems];
                        list[idx].fisheryName = e.target.value;
                        setFormData({ ...formData, fisheryItems: list });
                      }}
                      className="w-full px-2 py-1 border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Tổng thu (bán+ăn):</label>
                    <input
                      type="number"
                      value={fish.harvestValueSold + fish.harvestValueSelfUsed}
                      onChange={(e) => {
                        const list = [...formData.fisheryItems];
                        list[idx].harvestValueSold = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, fisheryItems: list });
                      }}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Tổng chi (giống+thức ăn):</label>
                    <input
                      type="number"
                      value={fish.breedCost + fish.feedAndMedicineCost + fish.otherCost}
                      onChange={(e) => {
                        const list = [...formData.fisheryItems];
                        list[idx].feedAndMedicineCost = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, fisheryItems: list });
                      }}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700">
                      Net: {formatVND(fish.harvestValueSold - fish.feedAndMedicineCost)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          fisheryItems: formData.fisheryItems.filter((f) => f.id !== fish.id),
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: MỤC 6 - PHI NÔNG NGHIỆP, CHẾ BIẾN */}
          {activeTab === "sec6" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 6: Thu nhập hoạt động SXKD phi nông lâm thủy sản & chế biến
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Lưu ý đặc biệt: Đối với thương nghiệp chỉ tính thặng dư thương mại (không tính trị giá vốn hàng bán làm thu nhập).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNonFarmItem}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm hoạt động ngành nghề</span>
                </button>
              </div>

              {formData.nonFarmItems.map((nf, idx) => (
                <div key={nf.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={nf.activityName}
                      onChange={(e) => {
                        const list = [...formData.nonFarmItems];
                        list[idx].activityName = e.target.value;
                        setFormData({ ...formData, nonFarmItems: list });
                      }}
                      placeholder="Tên ngành nghề / hoạt động..."
                      className="w-2/3 px-2 py-1 border rounded font-bold"
                    />
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700">
                        Net: {formatVND(nf.valueSold - (nf.materialCost + nf.energyCost + nf.otherCost))} nghìn đ
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            nonFarmItems: formData.nonFarmItems.filter((i) => i.id !== nf.id),
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Doanh thu / Bán:</label>
                      <input
                        type="number"
                        value={nf.valueSold}
                        onChange={(e) => {
                          const list = [...formData.nonFarmItems];
                          list[idx].valueSold = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, nonFarmItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Nguyên vật liệu / Vốn hàng:</label>
                      <input
                        type="number"
                        value={nf.materialCost}
                        onChange={(e) => {
                          const list = [...formData.nonFarmItems];
                          list[idx].materialCost = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, nonFarmItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Năng lượng / Điện nước:</label>
                      <input
                        type="number"
                        value={nf.energyCost}
                        onChange={(e) => {
                          const list = [...formData.nonFarmItems];
                          list[idx].energyCost = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, nonFarmItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Chi khác (thuê MB, khấu hao):</label>
                      <input
                        type="number"
                        value={nf.otherCost}
                        onChange={(e) => {
                          const list = [...formData.nonFarmItems];
                          list[idx].otherCost = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, nonFarmItems: list });
                        }}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: MỤC 7 - THU NHẬP KHÁC */}
          {activeTab === "sec7" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mục 7: Thu nhập khác (kiều hối, biếu tặng, thuê tài sản, xổ số...)
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Các khoản thu không do trực tiếp lao động sản xuất tạo ra trong 12 tháng qua.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOtherItem}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm nguồn thu khác</span>
                </button>
              </div>

              {formData.otherIncomeItems.map((item, idx) => (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-4 gap-2 items-center">
                  <div>
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const list = [...formData.otherIncomeItems];
                        list[idx].category = e.target.value as any;
                        setFormData({ ...formData, otherIncomeItems: list });
                      }}
                      className="w-full px-2 py-1 border rounded"
                    >
                      <option value="EXTERNAL_SUPPORT">Kiều hối / Biếu tặng mừng</option>
                      <option value="DISASTER_RELIEF">Hỗ trợ đột xuất bão lũ/thiên tai</option>
                      <option value="PROPERTY_FINANCE">Cho thuê nhà đất / Lãi tiết kiệm</option>
                      <option value="LOTTERY_PRIZES">Trúng xổ số / Trúng thưởng</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const list = [...formData.otherIncomeItems];
                        list[idx].description = e.target.value;
                        setFormData({ ...formData, otherIncomeItems: list });
                      }}
                      placeholder="Mô tả chi tiết nguồn thu..."
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const list = [...formData.otherIncomeItems];
                        list[idx].amount = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, otherIncomeItems: list });
                      }}
                      className="w-full px-2 py-1 border rounded font-bold font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          otherIncomeItems: formData.otherIncomeItems.filter((o) => o.id !== item.id),
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 8: TỔNG HỢP & XÁC THỰC LOGIC */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* Exclusion Verification Checklist */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasExcludedCapitalTransaction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasExcludedCapitalTransaction: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Xác nhận Kiểm tra Logic & Loại Trừ Giao Dịch Vốn (Bắt buộc theo QĐ 2545):
                    </span>
                    <span className="text-[11px] text-amber-900 leading-normal block mt-0.5">
                      Đã kiểm tra và đảm bảo <strong>KHÔNG</strong> tính các khoản vốn sau vào thu nhập hộ: Rút tiết kiệm, thu nợ cũ, vay mượn nợ, bán nhà đất/xe máy, chuyển nhượng cổ phần, và tiền bồi thường đền bù giải tỏa đất đai.
                    </span>
                  </div>
                </label>
              </div>

              {/* Official Table Breakdown - Trang 48 */}
              <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs">
                <div className="bg-slate-100 p-2.5 font-bold text-slate-900 text-center border-b border-slate-300 uppercase tracking-wide">
                  Biểu tổng hợp thu nhập của hộ trong 12 tháng qua
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Nguồn thu</th>
                      <th className="py-2 px-3 text-right">Tổng thu nhập (1.000 VNĐ)</th>
                      <th className="py-2 px-3 text-right">Tỷ trọng (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-medium">1. Thu nhập từ tiền lương, tiền công</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section1_salary)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section1_salary / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">2. Thu nhập từ trồng trọt</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section2_crops.net)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section2_crops.net / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">3. Thu nhập từ chăn nuôi</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section3_livestock.net)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section3_livestock.net / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">4. Thu nhập từ lâm nghiệp</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section4_forestry.net)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section4_forestry.net / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">5. Thu nhập từ thủy sản</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section5_fishery.net)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section5_fishery.net / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">6. Thu nhập từ SXKD phi nông nghiệp, dịch vụ & chế biến</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section6_nonFarm.net)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section6_nonFarm.net / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">7. Thu nhập khác</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(incomeBreakdown.section7_other)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {incomeBreakdown.totalNetIncome > 0
                          ? ((incomeBreakdown.section7_other / incomeBreakdown.totalNetIncome) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 uppercase text-slate-900">Tổng thu nhập hộ (1.000 VNĐ):</td>
                      <td className="py-2.5 px-3 text-right text-base text-emerald-800 font-black">
                        {formatVND(incomeBreakdown.totalNetIncome)}
                      </td>
                      <td className="py-2.5 px-3 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Per Capita Result Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Số nhân khẩu hợp lệ:</span>
                  <span className="text-xl font-bold text-slate-900">
                    {incomeBreakdown.validMembersCount} người
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Thu nhập BQ/người/năm:</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {formatVND(incomeBreakdown.perCapitaAnnual, "nghìn đ")}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Thu nhập BQ/người/tháng:</span>
                  <span className="text-xl font-bold text-indigo-700">
                    {formatVND(incomeBreakdown.perCapitaMonthly, "nghìn đ")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Tổng thu thuần hộ:{" "}
              <strong className="text-slate-900">{formatVND(incomeBreakdown.totalNetIncome)} nghìn đ</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => {
                onSave({ ...formData, isVerified: true });
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Nghiệm thu & lưu phiếu hộ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
