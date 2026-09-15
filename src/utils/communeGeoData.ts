import { CommuneProfile } from "../types";
import { calculateTGTSPRow, calculateCommuneTNBQ } from "./calculations";

export interface GeoCommuneFeature {
  id: string; // Matches CommuneProfile.id
  communeName: string;
  districtName: string;
  type: "Phường" | "Xã";
  svgPath: string; // SVG path d attribute (viewBox 0 0 800 600)
  centerPoint: { x: number; y: number };
  areaKm2: number;
  economicZone: "Dịch vụ - Đô thị" | "Nông nghiệp công nghệ cao" | "Chuyên canh Cà phê & Chế biến" | "Thương mại tổng hợp";
  terrain: "Đồng bằng / Đô thị" | "Cao nguyên bán sơn địa" | "Thung lũng đồi bazan";
  mainWaterBody?: string;
  mainRoads: string[];
}

/**
 * Bản đồ vector phân vùng ranh giới hành chính các xã/phường (Tọa độ chuẩn SVG ViewBox 0 0 800 600)
 * Mô phỏng chân thực địa giới hành chính liên xã vùng cao nguyên Pleiku - Gia Lai
 */
export const GEO_COMMUNE_FEATURES: GeoCommuneFeature[] = [
  {
    id: "commune-quy-nhon",
    communeName: "Phường Quy Nhơn",
    districtName: "Thành phố Pleiku",
    type: "Phường",
    // Trung tâm - Tây Nam
    svgPath:
      "M 180 230 L 290 190 L 370 240 L 350 340 L 280 390 L 190 350 L 150 290 Z",
    centerPoint: { x: 265, y: 285 },
    areaKm2: 12.8,
    economicZone: "Thương mại tổng hợp",
    terrain: "Đồng bằng / Đô thị",
    mainWaterBody: "Hồ Diệp Kính & Suối Hội Phú",
    mainRoads: ["Trần Hưng Đạo", "Lê Duẩn", "Quốc lộ 14"],
  },
  {
    id: "commune-thang-loi",
    communeName: "Phường Thắng Lợi",
    districtName: "Thành phố Pleiku",
    type: "Phường",
    // Phía Bắc - Đông Bắc, giáp khu vực Biển Hồ
    svgPath:
      "M 290 190 L 420 120 L 530 160 L 510 260 L 370 240 Z",
    centerPoint: { x: 420, y: 190 },
    areaKm2: 18.5,
    economicZone: "Dịch vụ - Đô thị",
    terrain: "Đồng bằng / Đô thị",
    mainWaterBody: "Kênh dẫn thủy Biển Hồ",
    mainRoads: ["Quốc lộ 19", "Đường Cách Mạng Tháng 8"],
  },
  {
    id: "commune-chu-a",
    communeName: "Xã Chư Á",
    districtName: "Thành phố Pleiku",
    type: "Xã",
    // Phía Đông - Đông Bắc (Vùng đồi bạt ngàn rau củ quả, hoa công nghệ cao)
    svgPath:
      "M 370 240 L 510 260 L 680 230 L 720 370 L 580 430 L 460 380 L 350 340 Z",
    centerPoint: { x: 530, y: 320 },
    areaKm2: 31.6,
    economicZone: "Nông nghiệp công nghệ cao",
    terrain: "Thung lũng đồi bazan",
    mainWaterBody: "Suối Chư Á & Hồ Ia Ring",
    mainRoads: ["Quốc lộ 19", "Tuyến đường vành đai Đông"],
  },
  {
    id: "commune-an-phu",
    communeName: "Xã An Phú",
    districtName: "Thành phố Pleiku",
    type: "Xã",
    // Phía Đông Nam (Vùng chuyên canh cà phê, sầu riêng, hồ tiêu và chăn nuôi)
    svgPath:
      "M 350 340 L 460 380 L 580 430 L 570 540 L 410 560 L 280 490 L 280 390 Z",
    centerPoint: { x: 440, y: 460 },
    areaKm2: 36.4,
    economicZone: "Chuyên canh Cà phê & Chế biến",
    terrain: "Cao nguyên bán sơn địa",
    mainWaterBody: "Suối Ia Linh",
    mainRoads: ["Quốc lộ 19B", "Đường liên xã An Phú - Đak Đoa"],
  },
];

export interface CommuneMapDataPoint {
  feature: GeoCommuneFeature;
  profile?: CommuneProfile;
  totalTGTSPCurrent: number; // Triệu đồng
  totalTGTSPConstant: number; // Triệu đồng
  tnbqMillionAnnual: number; // Triệu đồng/người/năm
  population: number;
  households: number;
  densityPeoplePerKm2: number;
  ntmStatus: "NTM_ADVANCED" | "NTM_BASIC" | "NOT_QUALIFIED";
  sectorRatios: { s1: number; s2: number; s3: number };
  sampleSize: number;
}

/**
 * Tổng hợp dữ liệu hiển thị không gian cho từng xã
 */
export function buildCommuneMapData(
  communes: CommuneProfile[]
): CommuneMapDataPoint[] {
  return GEO_COMMUNE_FEATURES.map((feat) => {
    const profile = communes.find((c) => c.id === feat.id);

    let totalCurrent = 0;
    let totalConstant = 0;
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;

    if (profile && profile.tgtspRows) {
      profile.tgtspRows.forEach((r) => {
        const calc = calculateTGTSPRow(r);
        totalCurrent += calc.currentPriceValue;
        totalConstant += calc.constantPriceValue;
        const code = (r.industryCode || "").toUpperCase();
        if (code.startsWith("A")) s1 += calc.currentPriceValue;
        else if (
          code.startsWith("B") ||
          code.startsWith("C") ||
          code.startsWith("D") ||
          code.startsWith("E") ||
          code.startsWith("F")
        )
          s2 += calc.currentPriceValue;
        else s3 += calc.currentPriceValue;
      });
    }

    const tnbq = profile ? calculateCommuneTNBQ(profile) : null;
    const tnbqMillion = tnbq ? tnbq.averagePerCapitaAnnualMillionVND : 65;
    const pop = profile?.totalPopulation || Math.round(feat.areaKm2 * 350);
    const households = profile?.totalHouseholds || Math.round(pop / 3.8);
    const density = Math.round(pop / feat.areaKm2);

    let ntmStatus: CommuneMapDataPoint["ntmStatus"] = "NOT_QUALIFIED";
    if (tnbqMillion >= 76) {
      ntmStatus = "NTM_ADVANCED";
    } else if (tnbqMillion >= 65) {
      ntmStatus = "NTM_BASIC";
    }

    const s1Ratio = totalCurrent > 0 ? (s1 / totalCurrent) * 100 : 33;
    const s2Ratio = totalCurrent > 0 ? (s2 / totalCurrent) * 100 : 33;
    const s3Ratio = totalCurrent > 0 ? (s3 / totalCurrent) * 100 : 34;

    return {
      feature: feat,
      profile,
      totalTGTSPCurrent: totalCurrent,
      totalTGTSPConstant: totalConstant,
      tnbqMillionAnnual: tnbqMillion,
      population: pop,
      households,
      densityPeoplePerKm2: density,
      ntmStatus,
      sectorRatios: { s1: s1Ratio, s2: s2Ratio, s3: s3Ratio },
      sampleSize: profile?.surveys?.length || 30,
    };
  });
}
