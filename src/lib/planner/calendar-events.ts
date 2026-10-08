// Du lieu ngay le/ky niem/quoc te cho Planner — KHONG gop chung thanh 1 loai
// "holiday" duy nhat, ma chia theo CalendarEventType de sau nay filter mau/
// icon rieng cho tung nhom (yeu cau nguoi dung 2026-10-08).
//
// isHoliday/isDayOff CHI true cho national_holiday chinh thuc cua VN (nghi
// le, nghi huong luong theo Luat Lao dong). Moi loai khac (observance,
// international, awareness, season, commercial, cultural) deu
// isHoliday:false, isDayOff:false — day la cac ngay "ky niem/danh de nho",
// khong phai ngay nghi.

export type CalendarEventType =
  | "national_holiday"
  | "public_holiday"
  | "cultural"
  | "international"
  | "observance"
  | "season"
  | "awareness"
  | "commercial";

export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  nameEn?: string;

  type: CalendarEventType;

  country?: string; // VN, GLOBAL
  isHoliday: boolean;
  isDayOff?: boolean;

  icon?: string;
  color?: string;

  description?: string;
};

// Mau theo nhom type (section 15, mapping nguoi dung gui) — dung lam fallback
// khi 1 CalendarEvent khong tu set `color` rieng.
export const CALENDAR_EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  national_holiday: "#ef4444", // Soft Red
  public_holiday: "#f87171", // nghi bu — cung nhom do, nhat hon
  cultural: "#a78bfa", // Lavender
  international: "#3b82f6", // Blue
  observance: "#fb923c", // Peach
  awareness: "#22c55e", // Green
  season: "#38bdf8", // Sky
  commercial: "#ec4899", // Pink
};

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  national_holiday: "Ngày lễ chính thức",
  public_holiday: "Nghỉ bù",
  cultural: "Văn hoá / kỷ niệm",
  international: "Ngày quốc tế",
  observance: "Ngày hưởng ứng",
  awareness: "Ngày nâng cao nhận thức",
  season: "Thời điểm mùa",
  commercial: "Thương mại",
};

// ---------------------------------------------------------------------------
// 1. Ngày lễ chính thức Việt Nam — 2026 (nghỉ lễ, có lương)
// ---------------------------------------------------------------------------

const VN_NATIONAL_HOLIDAYS_2026: CalendarEvent[] = [
  { id: "vn-2026-new-year", date: "2026-01-01", name: "Tết Dương lịch", nameEn: "New Year's Day", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-tet-eve", date: "2026-02-16", name: "Giao thừa", nameEn: "Lunar New Year's Eve", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-tet-1", date: "2026-02-17", name: "Mùng 1 Tết Nguyên Đán", nameEn: "Lunar New Year Day 1", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-tet-2", date: "2026-02-18", name: "Mùng 2 Tết", nameEn: "Lunar New Year Day 2", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-tet-3", date: "2026-02-19", name: "Mùng 3 Tết", nameEn: "Lunar New Year Day 3", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-tet-4", date: "2026-02-20", name: "Mùng 4 Tết", nameEn: "Lunar New Year Day 4", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-tet-5", date: "2026-02-21", name: "Mùng 5 Tết", nameEn: "Lunar New Year Day 5", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-hung-vuong", date: "2026-04-26", name: "Giỗ Tổ Hùng Vương", nameEn: "Hùng Kings' Festival", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-hung-vuong-bu", date: "2026-04-27", name: "Nghỉ bù Giỗ Tổ", nameEn: "Hùng Kings' Festival (observed)", type: "public_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-reunification", date: "2026-04-30", name: "Ngày Giải phóng miền Nam", nameEn: "Reunification Day", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-labor", date: "2026-05-01", name: "Quốc tế Lao động", nameEn: "International Labor Day", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
  { id: "vn-2026-national-day", date: "2026-09-02", name: "Quốc khánh", nameEn: "National Day", type: "national_holiday", country: "VN", isHoliday: true, isDayOff: true },
];

// ---------------------------------------------------------------------------
// 2. Các ngày kỷ niệm Việt Nam (cultural, không nghỉ)
// ---------------------------------------------------------------------------

const VN_CULTURAL_DAYS_2026: CalendarEvent[] = [
  { id: "vn-2026-children", date: "2026-06-01", name: "Quốc tế Thiếu nhi", nameEn: "International Children's Day", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-press", date: "2026-06-21", name: "Ngày Báo chí Cách mạng Việt Nam", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-family", date: "2026-06-28", name: "Ngày Gia đình Việt Nam", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-war-invalids", date: "2026-07-27", name: "Ngày Thương binh - Liệt sĩ", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-august-revolution", date: "2026-08-19", name: "Cách mạng Tháng Tám", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-women", date: "2026-10-20", name: "Ngày Phụ nữ Việt Nam", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-teachers", date: "2026-11-20", name: "Ngày Nhà giáo Việt Nam", nameEn: "Vietnamese Teachers' Day", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "vn-2026-army", date: "2026-12-22", name: "Ngày thành lập Quân đội Nhân dân Việt Nam", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
];

// ---------------------------------------------------------------------------
// 3. Ngày quốc tế phổ biến (international / awareness / observance / season)
//    Phân loại: "international" cho ngay UN/commemorative pho bien; "awareness"
//    cho cac ngay nang cao nhan thuc 1 van de (y te/moi truong/xa hoi); "observance"
//    cho cac ngay van hoa dai chung (Valentine, Halloween...) khong thuoc danh
//    muc UN chinh thuc. Phan loai nay la best-effort, co the tinh chinh sau.
// ---------------------------------------------------------------------------

const INTERNATIONAL_DAYS_2026: CalendarEvent[] = [
  // January
  { id: "intl-2026-new-year", date: "2026-01-01", name: "New Year's Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-braille", date: "2026-01-04", name: "World Braille Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-education", date: "2026-01-24", name: "International Day of Education", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-clean-energy", date: "2026-01-26", name: "International Day of Clean Energy", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-holocaust", date: "2026-01-27", name: "Holocaust Remembrance Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-peaceful-coexistence", date: "2026-01-28", name: "International Day of Peaceful Coexistence", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // February
  { id: "intl-2026-wetlands", date: "2026-02-02", name: "World Wetlands Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-cancer", date: "2026-02-04", name: "World Cancer Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-fgm", date: "2026-02-06", name: "Zero Tolerance for FGM", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-pulses", date: "2026-02-10", name: "World Pulses Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-women-science", date: "2026-02-11", name: "International Day of Women and Girls in Science", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-radio", date: "2026-02-13", name: "World Radio Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-valentine", date: "2026-02-14", name: "Valentine's Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-social-justice", date: "2026-02-20", name: "World Day of Social Justice", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-mother-language", date: "2026-02-21", name: "International Mother Language Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // March
  { id: "intl-2026-zero-discrimination", date: "2026-03-01", name: "Zero Discrimination Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-wildlife", date: "2026-03-03", name: "World Wildlife Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-womens-day", date: "2026-03-08", name: "International Women's Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-consumer-rights", date: "2026-03-15", name: "World Consumer Rights Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-happiness", date: "2026-03-20", name: "International Day of Happiness", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-french-language", date: "2026-03-20", name: "French Language Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-equinox-march", date: "2026-03-20", name: "March Equinox", type: "season", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-poetry", date: "2026-03-21", name: "World Poetry Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-forests", date: "2026-03-21", name: "International Day of Forests", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-water", date: "2026-03-22", name: "World Water Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-meteorological", date: "2026-03-23", name: "World Meteorological Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-tuberculosis", date: "2026-03-24", name: "World Tuberculosis Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-zero-waste", date: "2026-03-30", name: "International Day of Zero Waste", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // April
  { id: "intl-2026-april-fools", date: "2026-04-01", name: "April Fools' Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-autism", date: "2026-04-02", name: "World Autism Awareness Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-sport", date: "2026-04-06", name: "International Day of Sport for Development and Peace", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-health", date: "2026-04-07", name: "World Health Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-space-flight", date: "2026-04-12", name: "International Day of Human Space Flight", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-chinese-language", date: "2026-04-20", name: "Chinese Language Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-creativity", date: "2026-04-21", name: "World Creativity and Innovation Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-earth", date: "2026-04-22", name: "Earth Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-book", date: "2026-04-23", name: "World Book Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-english-language", date: "2026-04-23", name: "English Language Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-spanish-language", date: "2026-04-23", name: "Spanish Language Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-malaria", date: "2026-04-25", name: "World Malaria Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-ip", date: "2026-04-26", name: "World Intellectual Property Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-safety-work", date: "2026-04-28", name: "World Day for Safety and Health at Work", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-jazz", date: "2026-04-30", name: "International Jazz Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // May
  { id: "intl-2026-workers", date: "2026-05-01", name: "International Workers' Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-press-freedom", date: "2026-05-03", name: "World Press Freedom Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-red-cross", date: "2026-05-08", name: "World Red Cross Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-mothers-day", date: "2026-05-10", name: "Mother's Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-families", date: "2026-05-15", name: "International Day of Families", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-telecom", date: "2026-05-17", name: "World Telecommunication Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-bee", date: "2026-05-20", name: "World Bee Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-tea", date: "2026-05-21", name: "International Tea Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-biodiversity", date: "2026-05-22", name: "International Day for Biological Diversity", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-no-tobacco", date: "2026-05-31", name: "World No Tobacco Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // June
  { id: "intl-2026-bicycle", date: "2026-06-03", name: "World Bicycle Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-environment", date: "2026-06-05", name: "World Environment Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-food-safety", date: "2026-06-07", name: "World Food Safety Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-oceans", date: "2026-06-08", name: "World Oceans Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-child-labour", date: "2026-06-12", name: "World Day Against Child Labour", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-blood-donor", date: "2026-06-14", name: "World Blood Donor Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-remittances", date: "2026-06-16", name: "International Day of Family Remittances", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-desertification", date: "2026-06-17", name: "Desertification and Drought Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-gastronomy", date: "2026-06-18", name: "Sustainable Gastronomy Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-refugee", date: "2026-06-20", name: "World Refugee Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-fathers-day", date: "2026-06-21", name: "Father's Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-yoga", date: "2026-06-21", name: "International Yoga Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-solstice-june", date: "2026-06-21", name: "June Solstice", type: "season", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-public-service", date: "2026-06-23", name: "UN Public Service Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-drug-abuse", date: "2026-06-26", name: "International Day Against Drug Abuse", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-msme", date: "2026-06-27", name: "Micro-, Small and Medium-sized Enterprises Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-asteroid", date: "2026-06-30", name: "Asteroid Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // July
  { id: "intl-2026-cooperatives", date: "2026-07-05", name: "International Day of Cooperatives", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-population", date: "2026-07-11", name: "World Population Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-youth-skills", date: "2026-07-15", name: "World Youth Skills Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-mandela", date: "2026-07-18", name: "Nelson Mandela International Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-chess", date: "2026-07-20", name: "International Chess Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-moon", date: "2026-07-20", name: "International Moon Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-drowning", date: "2026-07-25", name: "World Drowning Prevention Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-hepatitis", date: "2026-07-28", name: "World Hepatitis Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-friendship", date: "2026-07-30", name: "International Day of Friendship", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-trafficking", date: "2026-07-30", name: "World Day Against Trafficking in Persons", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // August
  { id: "intl-2026-breastfeeding-week", date: "2026-08-01", name: "World Breastfeeding Week (bắt đầu)", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-indigenous", date: "2026-08-09", name: "International Day of the World's Indigenous Peoples", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-youth-day", date: "2026-08-12", name: "International Youth Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-humanitarian", date: "2026-08-19", name: "World Humanitarian Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-terrorism-victims", date: "2026-08-21", name: "International Day of Remembrance of and Tribute to the Victims of Terrorism", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-slave-trade", date: "2026-08-23", name: "International Day for the Remembrance of the Slave Trade and its Abolition", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-nuclear-tests", date: "2026-08-29", name: "International Day Against Nuclear Tests", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-enforced-disappearances", date: "2026-08-30", name: "International Day of the Victims of Enforced Disappearances", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-african-descent", date: "2026-08-31", name: "International Day for People of African Descent", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // September
  { id: "intl-2026-charity", date: "2026-09-05", name: "International Day of Charity", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-clean-air", date: "2026-09-07", name: "International Day of Clean Air for Blue Skies", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-literacy", date: "2026-09-08", name: "International Literacy Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-democracy", date: "2026-09-15", name: "International Day of Democracy", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-ozone", date: "2026-09-16", name: "International Day for the Preservation of the Ozone Layer", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-patient-safety", date: "2026-09-17", name: "World Patient Safety Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-equal-pay", date: "2026-09-18", name: "International Equal Pay Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-equinox-sept", date: "2026-09-23", name: "September Equinox", type: "season", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-peace", date: "2026-09-21", name: "International Day of Peace", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-sign-languages", date: "2026-09-23", name: "International Day of Sign Languages", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-maritime", date: "2026-09-24", name: "World Maritime Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-tourism", date: "2026-09-27", name: "World Tourism Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-info-access", date: "2026-09-28", name: "International Day for Universal Access to Information", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-food-loss", date: "2026-09-29", name: "International Day of Awareness of Food Loss and Waste", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-translation", date: "2026-09-30", name: "International Translation Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // October
  { id: "intl-2026-coffee", date: "2026-10-01", name: "International Coffee Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-older-persons", date: "2026-10-01", name: "International Day of Older Persons", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-non-violence", date: "2026-10-02", name: "International Day of Non-Violence", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-space-week", date: "2026-10-04", name: "World Space Week (bắt đầu)", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-teachers-day", date: "2026-10-05", name: "World Teachers' Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-habitat", date: "2026-10-06", name: "World Habitat Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-post", date: "2026-10-09", name: "World Post Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-mental-health", date: "2026-10-10", name: "World Mental Health Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-girl-child", date: "2026-10-11", name: "International Day of the Girl Child", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-disaster-risk", date: "2026-10-13", name: "International Day for Disaster Risk Reduction", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-rural-women", date: "2026-10-15", name: "International Day of Rural Women", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-food-day", date: "2026-10-16", name: "World Food Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-poverty", date: "2026-10-17", name: "International Day for the Eradication of Poverty", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-snow-leopard", date: "2026-10-23", name: "International Day of the Snow Leopard", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-un-day", date: "2026-10-24", name: "United Nations Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-audiovisual", date: "2026-10-27", name: "World Audiovisual Heritage Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-care-support", date: "2026-10-29", name: "International Day of Care and Support", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-halloween", date: "2026-10-31", name: "Halloween", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-cities", date: "2026-10-31", name: "World Cities Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // November
  { id: "intl-2026-journalists-impunity", date: "2026-11-02", name: "International Day to End Impunity for Crimes Against Journalists", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-tsunami", date: "2026-11-05", name: "World Tsunami Awareness Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-science-day", date: "2026-11-10", name: "World Science Day for Peace and Development", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-diabetes", date: "2026-11-14", name: "World Diabetes Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-tolerance", date: "2026-11-16", name: "International Day for Tolerance", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-toilet", date: "2026-11-19", name: "World Toilet Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-childrens-day", date: "2026-11-20", name: "World Children's Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-television", date: "2026-11-21", name: "World Television Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-vn-culture", date: "2026-11-24", name: "Vietnam Culture Day", type: "cultural", country: "VN", isHoliday: false, isDayOff: false },
  { id: "intl-2026-violence-women", date: "2026-11-25", name: "International Day for the Elimination of Violence against Women", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },

  // December
  { id: "intl-2026-aids", date: "2026-12-01", name: "World AIDS Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-slavery-abolition", date: "2026-12-02", name: "International Day for the Abolition of Slavery", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-disabilities", date: "2026-12-03", name: "International Day of Persons with Disabilities", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-volunteer", date: "2026-12-05", name: "International Volunteer Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-soil", date: "2026-12-05", name: "World Soil Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-aviation", date: "2026-12-07", name: "International Civil Aviation Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-anti-corruption", date: "2026-12-09", name: "International Anti-Corruption Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-human-rights", date: "2026-12-10", name: "Human Rights Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-mountain", date: "2026-12-11", name: "International Mountain Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-health-coverage", date: "2026-12-12", name: "Universal Health Coverage Day", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-migrants", date: "2026-12-18", name: "International Migrants Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-arabic-language", date: "2026-12-18", name: "Arabic Language Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-human-solidarity", date: "2026-12-20", name: "International Human Solidarity Day", type: "international", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-meditation", date: "2026-12-21", name: "World Meditation Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-basketball", date: "2026-12-21", name: "World Basketball Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-solstice-dec", date: "2026-12-22", name: "December Solstice", type: "season", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-christmas-eve", date: "2026-12-24", name: "Christmas Eve", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-christmas", date: "2026-12-25", name: "Christmas Day", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-epidemic-preparedness", date: "2026-12-27", name: "International Day of Epidemic Preparedness", type: "awareness", country: "GLOBAL", isHoliday: false, isDayOff: false },
  { id: "intl-2026-new-year-eve", date: "2026-12-31", name: "New Year's Eve", type: "observance", country: "GLOBAL", isHoliday: false, isDayOff: false },
];

export const CALENDAR_EVENTS_2026: CalendarEvent[] = [
  ...VN_NATIONAL_HOLIDAYS_2026,
  ...VN_CULTURAL_DAYS_2026,
  ...INTERNATIONAL_DAYS_2026,
];

// ---------------------------------------------------------------------------
// 4. Ngày văn hoá/lunar Việt Nam — KHÔNG hard-code ngày dương vì lệch mỗi năm.
//    Can 1 ham chuyen lich am -> duong (CHUA lam trong task nay) de resolve
//    sang CalendarEvent.date theo tung nam cu the. Tet Nguyen Dan/Gio To Hung
//    Vuong 2026 da co ngay duong CHINH THUC o VN_NATIONAL_HOLIDAYS_2026 (cong
//    bo boi nha nuoc) nen KHONG lap lai o day.
// ---------------------------------------------------------------------------

export type LunarCalendarEvent = {
  id: string;
  name: string;
  nameEn?: string;
  type: CalendarEventType;
  country: "VN";
  calendar: "lunar";
  lunarMonth: number;
  lunarDay: number;
  isHoliday: boolean;
  isDayOff?: boolean;
  icon?: string;
  color?: string;
  description?: string;
};

export const LUNAR_CALENDAR_EVENTS_VN: LunarCalendarEvent[] = [
  { id: "vn-lunar-ram-thang-gieng", name: "Rằm tháng Giêng", nameEn: "Lantern Festival", type: "cultural", country: "VN", calendar: "lunar", lunarMonth: 1, lunarDay: 15, isHoliday: false, isDayOff: false },
  { id: "vn-lunar-han-thuc", name: "Tết Hàn Thực", type: "cultural", country: "VN", calendar: "lunar", lunarMonth: 3, lunarDay: 3, isHoliday: false, isDayOff: false },
  { id: "vn-lunar-doan-ngo", name: "Tết Đoan Ngọ", type: "cultural", country: "VN", calendar: "lunar", lunarMonth: 5, lunarDay: 5, isHoliday: false, isDayOff: false },
  { id: "vn-lunar-vu-lan", name: "Lễ Vu Lan", type: "cultural", country: "VN", calendar: "lunar", lunarMonth: 7, lunarDay: 15, isHoliday: false, isDayOff: false },
  { id: "vn-lunar-trung-thu", name: "Tết Trung Thu", nameEn: "Mid-Autumn Festival", type: "cultural", country: "VN", calendar: "lunar", lunarMonth: 8, lunarDay: 15, isHoliday: false, isDayOff: false },
  { id: "vn-lunar-ong-cong-ong-tao", name: "Ông Công Ông Táo", type: "cultural", country: "VN", calendar: "lunar", lunarMonth: 12, lunarDay: 23, isHoliday: false, isDayOff: false },
];
