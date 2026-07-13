export const BRAND = {
  name: 'The Kerala Store',
  nameMl: 'കേരള സ്റ്റോർ',
  shortName: 'Kerala Store',
  domain: 'thekerala.store',
  email: 'hello@thekeralastore.com',
  phoneDisplay: '+971 58 906 1969',
  whatsapp: '971589061969',
  currency: 'INR',
  upiId: '7736667000@SUPERYES',
  upiName: 'The Kerala Store',
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}
