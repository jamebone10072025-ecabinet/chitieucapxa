import React from "react";
import {
  Printer,
  Download,
  Award,
  CheckCircle2,
  Building2,
  Users,
  FileCheck,
} from "lucide-react";
import { CommuneProfile } from "../types";
import {
  calculateTGTSPRow,
  calculateProvincialCapAdjustment,
  calculateCommuneTNBQ,
  formatVND,
} from "../utils/calculations";

interface CommuneSummaryReportProps {
  commune: CommuneProfile;
}

export const CommuneSummaryReport: React.FC<CommuneSummaryReportProps> = ({
  commune,
}) => {
  // Tính tổng TGTSP
  let totalCurrentPrice = 0;
  let totalConstantPrice = 0;
  (commune.tgtspRows || []).forEach((r) => {
    const calc = calculateTGTSPRow(r);
    totalCurrentPrice += calc.currentPriceValue;
    totalConstantPrice += calc.constantPriceValue;
  });

  const capCheck = calculateProvincialCapAdjustment(
    totalCurrentPrice,
    commune.sumAllCommunesTGTSP,
    commune.provincialGTSX
  );

  // Tính TNBQ
  const tnbqStats = calculateCommuneTNBQ(commune);
  const isNTMQualified = tnbqStats.averagePerCapitaAnnualMillionVND >= 68.0;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(commune, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `BaoCao_ThongKe_${commune.communeName}_Nam${commune.reportingYear}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center justify-between no-print">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Biểu tổng hợp báo cáo 02 chỉ tiêu cấp xã (chuẩn công vụ A4)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mẫu biểu chuẩn theo quy định tại Quyết định số 2545/QĐ-BTC Bộ Tài chính
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo A4</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (A4 format) */}
      <div
        id="printable-report"
        className="bg-white rounded-xl shadow-md border border-slate-300 p-8 sm:p-12 max-w-4xl mx-auto text-slate-900 font-serif space-y-6 print:shadow-none print:border-none print:p-0"
      >
        {/* Official Letterhead */}
        <div className="grid grid-cols-2 text-center text-xs pb-4 border-b border-slate-800">
          <div>
            <div className="font-bold uppercase tracking-wider text-slate-800">
              ỦY BAN NHÂN DÂN {commune.districtName.toUpperCase()}
            </div>
            <div className="font-bold uppercase tracking-wider text-slate-950 underline underline-offset-4">
              UBND {commune.communeName.toUpperCase()}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 font-sans italic">
              Số: ......./BC-UBND
            </div>
          </div>

          <div>
            <div className="font-bold uppercase tracking-wider text-slate-900">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="font-bold tracking-wider underline underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="mt-1 text-[11px] text-slate-600 font-sans italic">
              {commune.communeName}, ngày 15 tháng 10 năm {commune.reportingYear}
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center pt-2">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-950">
            BÁO CÁO KẾT QUẢ BIÊN SOẠN 02 CHỈ TIÊU TỔNG HỢP CẤP XÃ NĂM {commune.reportingYear}
          </h2>
          <p className="text-xs font-sans italic text-slate-600 mt-1">
            (Thực hiện theo Quyết định số 2545/QĐ-BTC ngày 14 tháng 9 năm 2026 của Bộ Tài chính)
          </p>
        </div>

        {/* General Admin Info */}
        <div className="text-xs font-sans bg-slate-50 p-3.5 rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="text-slate-500 block">Địa bàn hành chính:</span>
            <strong className="text-slate-900">{commune.communeName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Huyện / Tỉnh:</span>
            <strong className="text-slate-900">
              {commune.districtName}, {commune.provinceName}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tổng số hộ:</span>
            <strong className="text-slate-900">
              {commune.totalHouseholds.toLocaleString("vi-VN")} hộ
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tổng số nhân khẩu:</span>
            <strong className="text-slate-900">
              {commune.totalPopulation.toLocaleString("vi-VN")} người
            </strong>
          </div>
        </div>

        {/* SECTION 1: TGTSP */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-sm uppercase text-slate-900 border-b pb-1">
            I. KẾT QUẢ BIÊN SOẠN TỔNG GIÁ TRỊ SẢN PHẨM TRÊN ĐỊA BÀN (PHỤ LỤC I)
          </h3>
          <p className="text-xs font-sans text-slate-700 leading-relaxed">
            Tổng giá trị sản phẩm trên địa bàn {commune.communeName} năm {commune.reportingYear} được tổng hợp từ các đơn vị kinh tế thường trú theo các phương pháp tính trực tiếp và phân bổ gián tiếp:
          </p>

          <table className="w-full text-left text-xs font-sans border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-12">STT</th>
                <th className="border border-slate-300 p-2">Phân ngành kinh tế</th>
                <th className="border border-slate-300 p-2 text-center">Phương thức</th>
                <th className="border border-slate-300 p-2 text-right">Giá hiện hành (Triệu đ)</th>
                <th className="border border-slate-300 p-2 text-right">Giá so sánh (Triệu đ)</th>
                <th className="border border-slate-300 p-2 text-center">Cơ cấu (%)</th>
              </tr>
            </thead>
            <tbody>
              {(commune.tgtspRows || []).map((r, idx) => {
                const calc = calculateTGTSPRow(r);
                const pct =
                  totalCurrentPrice > 0
                    ? ((calc.currentPriceValue / totalCurrentPrice) * 100).toFixed(1)
                    : 0;
                return (
                  <tr key={r.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">
                      {r.industryName} ({r.industryCode})
                    </td>
                    <td className="border border-slate-300 p-2 text-center text-[11px]">
                      {r.isDirect ? "Trực tiếp" : "Phân bổ"}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-bold">
                      {formatVND(calc.currentPriceValue)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right">
                      {formatVND(calc.constantPriceValue)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="font-bold bg-slate-100">
              <tr>
                <td colSpan={3} className="border border-slate-300 p-2 text-right uppercase">
                  Tổng cộng TGTSP:
                </td>
                <td className="border border-slate-300 p-2 text-right font-black text-slate-950">
                  {formatVND(totalCurrentPrice)}
                </td>
                <td className="border border-slate-300 p-2 text-right font-black">
                  {formatVND(totalConstantPrice)}
                </td>
                <td className="border border-slate-300 p-2 text-center">100%</td>
              </tr>
              {capCheck.isExceeded && (
                <tr className="bg-amber-50 text-amber-900">
                  <td colSpan={3} className="border border-slate-300 p-2 text-right italic">
                    Điều chỉnh khống chế trần GTSX Tỉnh (giảm trừ):
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-bold text-red-700">
                    -{formatVND(capCheck.communeReduction)}
                  </td>
                  <td colSpan={2} className="border border-slate-300 p-2 text-[11px] italic">
                    Chuẩn sau điều chỉnh: {formatVND(capCheck.finalAdjustedTGTSP)} tr.đ
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* SECTION 2: TNBQ */}
        <div className="space-y-3 pt-4">
          <h3 className="font-bold text-sm uppercase text-slate-900 border-b pb-1">
            II. KẾT QUẢ ĐIỀU TRA THU NHẬP BÌNH QUÂN ĐẦU NGƯỜI (PHỤ LỤC II)
          </h3>
          <p className="text-xs font-sans text-slate-700 leading-relaxed">
            Biểu kết quả thu nhập bình quân đầu người trên địa bàn {commune.communeName} (theo mẫu biểu quy định tại Mục VI.3 Phụ lục II):
          </p>

          <table className="w-full text-left text-xs font-sans border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-12">STT</th>
                <th className="border border-slate-300 p-2">Tên xã, phường, đặc khu</th>
                <th className="border border-slate-300 p-2 text-center">Số hộ điều tra mẫu</th>
                <th className="border border-slate-300 p-2 text-center">Số nhân khẩu mẫu</th>
                <th className="border border-slate-300 p-2 text-right font-bold">
                  Thu nhập bình quân đầu người (Nghìn đồng/năm)
                </th>
                <th className="border border-slate-300 p-2 text-right font-bold">
                  Quy đổi (Triệu đồng/người/năm)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 text-center font-bold">1</td>
                <td className="border border-slate-300 p-2 font-bold text-slate-950">
                  {commune.communeName}
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  {tnbqStats.sampleHouseholdsCount} hộ
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  {tnbqStats.samplePopulationCount} người
                </td>
                <td className="border border-slate-300 p-2 text-right font-black text-slate-900">
                  {formatVND(tnbqStats.averagePerCapitaAnnualThousandVND)}
                </td>
                <td className="border border-slate-300 p-2 text-right font-black text-emerald-800 text-sm">
                  {tnbqStats.averagePerCapitaAnnualMillionVND.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3: NTM ASSESSMENT */}
        <div className="space-y-2 pt-4 font-sans text-xs">
          <h3 className="font-bold text-sm uppercase text-slate-900 border-b pb-1 font-serif">
            III. ĐÁNH GIÁ THỰC HIỆN TIÊU CHÍ SỐ 10 (THU NHẬP NÔNG THÔN MỚI)
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed">
            <p className="flex items-center gap-2">
              <strong>Kết luận đánh giá:</strong>
              {isNTMQualified ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ĐẠT TIÊU CHÍ NÔNG THÔN MỚI NÂNG CAO
                </span>
              ) : (
                <span className="font-bold text-amber-800">
                  ĐẠT TIÊU CHÍ NÔNG THÔN MỚI CƠ BẢN
                </span>
              )}
            </p>
            <p className="text-slate-600 mt-1">
              Thu nhập bình quân đầu người năm {commune.reportingYear} của xã đạt{" "}
              <strong>{tnbqStats.averagePerCapitaAnnualMillionVND.toFixed(2)} triệu đồng/người/năm</strong>, tương đương{" "}
              <strong>{formatVND(tnbqStats.averagePerCapitaMonthlyThousandVND)} nghìn đồng/người/tháng</strong>. Toàn bộ các giao dịch vốn và trường hợp nhân khẩu ngoại lệ đã được rà soát và nghiệm thu đúng hướng dẫn Quyết định 2545/QĐ-BTC.
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 text-center text-xs pt-8 gap-4">
          <div>
            <div className="font-bold uppercase text-slate-800">CÁN BỘ PHỤ TRÁCH THỐNG KÊ XÃ</div>
            <div className="italic text-[11px] text-slate-500 mt-0.5">(Ký, ghi rõ họ tên)</div>
            <div className="h-20"></div>
            <div className="font-bold text-slate-900">Vũ Văn Nghiệp</div>
          </div>

          <div>
            <div className="font-bold uppercase text-slate-900">TM. ỦY BAN NHÂN DÂN XÃ</div>
            <div className="font-bold uppercase text-slate-950">CHỦ TỊCH</div>
            <div className="italic text-[11px] text-slate-500 mt-0.5">(Ký tên, đóng dấu)</div>
            <div className="h-20"></div>
            <div className="font-bold text-slate-900">Nguyễn Quốc Dũng</div>
          </div>
        </div>
      </div>
    </div>
  );
};
