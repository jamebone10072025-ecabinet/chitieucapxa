import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { TGTSPModule } from "./components/TGTSPModule";
import { TNBQModule } from "./components/TNBQModule";
import { CommuneSummaryReport } from "./components/CommuneSummaryReport";
import { HandbookModule } from "./components/HandbookModule";
import { AIConsultantModal } from "./components/AIConsultantModal";
import { CommuneProfile } from "./types";
import { MOCK_COMMUNES } from "./data/mockCommunes";
import { calculateTGTSPRow, calculateCommuneTNBQ } from "./utils/calculations";

const STORAGE_KEY = "QD2545_COMMUNES_DATA_V3";

export default function App() {
  // Load communes from localStorage or initialize with mock
  const [communes, setCommunes] = useState<CommuneProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasGiaLaiCommunes = parsed.some(
            (c: CommuneProfile) =>
              c.communeName?.includes("Quy Nhơn") || c.communeName?.includes("Pleiku")
          );
          if (hasGiaLaiCommunes) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse local storage communes:", e);
    }
    return MOCK_COMMUNES;
  });

  const [activeCommuneId, setActiveCommuneId] = useState<string>(
    communes[0]?.id || "commune-quy-nhon"
  );
  const [activeTab, setActiveTab] = useState<
    "tgtsp" | "tnbq" | "report" | "handbook"
  >("tgtsp");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(communes));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [communes]);

  const activeCommune =
    communes.find((c) => c.id === activeCommuneId) || communes[0] || MOCK_COMMUNES[0];

  // Calculate live header metrics
  const totalCurrentTGTSP = (activeCommune?.tgtspRows || []).reduce((sum, r) => {
    return sum + calculateTGTSPRow(r).currentPriceValue;
  }, 0);

  const tnbqStats = calculateCommuneTNBQ(activeCommune);
  const averagePerCapitaMillion = tnbqStats.averagePerCapitaAnnualMillionVND;

  const handleUpdateCommune = (updated: CommuneProfile) => {
    setCommunes((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handlePrintReport = () => {
    setActiveTab("report");
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleAddCommune = (name: string, district: string, province: string) => {
    const newCommune: CommuneProfile = {
      id: "commune-" + Date.now(),
      communeName: name,
      districtName: district,
      provinceName: province,
      reportingYear: 2026,
      baseYear: 2025,
      totalHouseholds: 2500,
      totalPopulation: 9800,
      sampleCount: 20,
      tgtspRows: [],
      surveys: [],
      provincialGTSX: 12000000,
      sumAllCommunesTGTSP: 11500000,
    };
    setCommunes([...communes, newCommune]);
    setActiveCommuneId(newCommune.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Header with Navigation & Live Indicators */}
      <Header
        commune={activeCommune}
        communesList={communes}
        allCommunes={communes}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectTab={setActiveTab}
        onSelectCommune={setActiveCommuneId}
        onOpenAIConsult={() => setIsAIModalOpen(true)}
        onOpenAI={() => setIsAIModalOpen(true)}
        onPrintReport={handlePrintReport}
        totalCurrentTGTSP={totalCurrentTGTSP}
        averagePerCapitaMillion={averagePerCapitaMillion}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "tgtsp" && (
          <TGTSPModule
            commune={activeCommune}
            onUpdateCommune={handleUpdateCommune}
          />
        )}

        {activeTab === "tnbq" && (
          <TNBQModule
            commune={activeCommune}
            onUpdateCommune={handleUpdateCommune}
          />
        )}

        {activeTab === "report" && (
          <CommuneSummaryReport commune={activeCommune} />
        )}

        {activeTab === "handbook" && <HandbookModule />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hệ thống quản lý & biên soạn 02 chỉ tiêu thống kê tổng hợp cấp xã
          </span>
          <span className="font-semibold text-slate-700">
            Căn cứ Quyết định số 2545/QĐ-BTC ngày 14/09/2026 của Bộ trưởng Bộ Tài chính
          </span>
        </div>
      </footer>

      {/* AI Statistical Consultant Modal */}
      <AIConsultantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        commune={activeCommune}
      />
    </div>
  );
}
