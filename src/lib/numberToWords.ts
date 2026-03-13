const unitsFr = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tensFr = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function convertHundredsFr(n: number): string {
  if (n === 0) return '';
  if (n < 20) return unitsFr[n];
  if (n < 70) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (unit === 0) return tensFr[ten];
    if (unit === 1 && ten !== 8) return `${tensFr[ten]} et un`;
    return `${tensFr[ten]}-${unitsFr[unit]}`;
  }
  if (n < 80) {
    const unit = n - 60;
    if (unit === 0) return 'soixante';
    if (unit === 1) return 'soixante et onze';
    return `soixante-${unitsFr[unit]}`;
  }
  if (n < 100) {
    const unit = n - 80;
    if (unit === 0) return 'quatre-vingts';
    return `quatre-vingt-${unitsFr[unit]}`;
  }
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const prefix = hundred === 1 ? 'cent' : `${unitsFr[hundred]} cent`;
  if (rest === 0) return hundred === 1 ? 'cent' : `${unitsFr[hundred]} cents`;
  return `${prefix} ${convertHundredsFr(rest)}`;
}

export function numberToWordsFr(n: number): string {
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const hundreds = Math.floor(n % 1_000);
  const cents = Math.round((n % 1) * 100);

  if (billions > 0) parts.push(`${convertHundredsFr(billions)} milliard${billions > 1 ? 's' : ''}`);
  if (millions > 0) parts.push(`${convertHundredsFr(millions)} million${millions > 1 ? 's' : ''}`);
  if (thousands > 0) parts.push(thousands === 1 ? 'mille' : `${convertHundredsFr(thousands)} mille`);
  if (hundreds > 0) parts.push(convertHundredsFr(hundreds));

  let result = parts.join(' ') || 'zéro';
  result += ' dirhams';
  if (cents > 0) result += ` et ${convertHundredsFr(cents)} centimes`;
  return result;
}

const unitsAr = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
const tensAr = ['', 'عشر', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

function convertHundredsAr(n: number): string {
  if (n === 0) return '';
  if (n <= 10) return unitsAr[n];
  if (n < 20) return `${unitsAr[n - 10]} ${unitsAr[10]}`;
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  if (unit === 0) return tensAr[ten];
  return `${unitsAr[unit]} و${tensAr[ten]}`;
}

export function numberToWordsAr(n: number): string {
  if (n === 0) return 'صفر';
  const intPart = Math.floor(n);
  const cents = Math.round((n % 1) * 100);
  
  let result = '';
  const thousands = Math.floor(intPart / 1000);
  const hundreds = intPart % 1000;
  
  if (thousands > 0) {
    if (thousands === 1) result += 'ألف';
    else if (thousands === 2) result += 'ألفان';
    else result += `${convertHundredsAr(thousands)} آلاف`;
    if (hundreds > 0) result += ' و';
  }
  
  if (hundreds > 0) {
    const h = Math.floor(hundreds / 100);
    const rest = hundreds % 100;
    if (h > 0) {
      if (h === 1) result += 'مائة';
      else if (h === 2) result += 'مائتان';
      else result += `${unitsAr[h]} مائة`;
      if (rest > 0) result += ' و';
    }
    if (rest > 0) result += convertHundredsAr(rest);
  }
  
  result += ' درهم';
  if (cents > 0) result += ` و ${convertHundredsAr(cents)} سنتيم`;
  return result;
}
