// Month-by-month "paid" status per brand, from the manually tracked revenue
// sheet. Not derivable from Amplitude or the brands table, so this is
// manually curated — update as new months close.
export const MONTHS = ['March', 'April', 'May', 'June', 'July']

// Brand name (matches the `brands` table) -> set of months paid.
export const PAID_MONTHS = {
  'Shree Nawab Restaurant': ['July'],
  'Icy Spicy': ['July'],
  'Fountain Hospitality': ['May', 'June', 'July'],
  'Bonn ton': ['April', 'May', 'June', 'July'],
  'Kulcha Theka': ['May', 'June', 'July'],
  'Vanakkam punjab': ['April', 'May', 'June', 'July'],
  'Beyond Burg': ['April', 'May', 'June', 'July'],
  "Radhika's South Indian": ['April', 'May', 'June', 'July'],
  'Door No 3 / Humble Krumble': ['April', 'May', 'June', 'July'],
  'Adige Dosa House': ['April', 'May', 'June', 'July'],
  'RR Durbar': ['May', 'June', 'July'],
  'Alice in Gelato land': ['May', 'June', 'July'],
  'Roadster Hospitality': ['April', 'May', 'June', 'July'],
  'Selva Mathi Farm': ['July'],
  'Selva Super Market': ['July'],
  'Hotel Preethi': ['July'],
  '12’o Clock biriyani': ['July'],
  'Petraz Restaurant': ['July'],
  'Kaymas Restaurant': ['July'],
  'Migration Overseas': ['April', 'May', 'June', 'July'],
  'Stellar Clinic': ['April', 'May', 'June', 'July'],
  'Subway baroda': ['April', 'May', 'June', 'July'],
  'Sri Annapurna Foods': ['June', 'July'],
  'Shankar Bhavan': ['July'],
}
