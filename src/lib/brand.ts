export const BRAND = {
  name: 'The Kerala Store',
  nameMl: 'കേരള സ്റ്റോർ',
  shortName: 'Kerala Store',
  domain: 'thekerala.store',
  email: 'hello@thekeralastore.com',
  phoneDisplay: '+91 73566 99803',
  whatsapp: '917356699803',
  currency: 'INR',
  upiId: '7736667000@SUPERYES',
  upiName: 'The Kerala Store',
} as const;

export function whatsappUrl(message: string, number: string = BRAND.whatsapp) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
