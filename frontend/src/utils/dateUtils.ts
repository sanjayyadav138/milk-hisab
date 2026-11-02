export interface MonthOption {
  key: string; // "YYYY-MM"
  year: number;
  month: number; // 1-12
  nameHi: string;
  nameEn: string;
  shortNameHi: string;
  shortNameEn: string;
  isCurrent: boolean;
  isPast: boolean;
  totalDays: number;
}

const MONTH_NAMES_HI = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_HI = [
  'जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून',
  'जुलाई', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'
];

const MONTH_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getCurrentMonthKey(refDate = new Date()): string {
  const y = refDate.getFullYear();
  const m = String(refDate.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getMonthInfo(year: number, month: number): MonthOption {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrent = year === curY && month === curM;
  const isPast = year < curY || (year === curY && month < curM);
  const key = `${year}-${String(month).padStart(2, '0')}`;
  const safeIdx = Math.max(0, Math.min(11, month - 1));

  return {
    key,
    year,
    month,
    nameHi: `${MONTH_NAMES_HI[safeIdx]} ${year}`,
    nameEn: `${MONTH_NAMES_EN[safeIdx]} ${year}`,
    shortNameHi: `${MONTH_SHORT_HI[safeIdx]} ${year}`,
    shortNameEn: `${MONTH_SHORT_EN[safeIdx]} ${year}`,
    isCurrent,
    isPast,
    totalDays: daysInMonth,
  };
}

export function getDynamicMonthList(count = 6, refDate = new Date()): MonthOption[] {
  const list: MonthOption[] = [];
  const startY = refDate.getFullYear();
  const startM = refDate.getMonth();

  for (let i = 0; i < count; i++) {
    const d = new Date(startY, startM - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    list.push(getMonthInfo(y, m));
  }
  return list;
}

export function getIsoDateAgo(daysAgo: number, refDate = new Date()): string {
  const d = new Date(refDate.getTime() - daysAgo * 86400000);
  return d.toISOString().split('T')[0];
}
