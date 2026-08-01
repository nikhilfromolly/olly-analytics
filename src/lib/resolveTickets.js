// Resolve ticket-closing isn't tracked as an Amplitude event, so this is
// manually curated. Update these lists as brands close tickets or activate
// Resolve without closing any yet.

// Brand name -> tickets closed (all manually confirmed, so all currently ≥5)
export const RESOLVE_TICKETS_CLOSED = {
  '12’o Clock biriyani': 20,
  'Adige Dosa House': 6,
  'Beyond Burg': 10,
  'Fountain Hospitality': 6,
  'Kulcha Theka': 8,
  'RR Durbar': 5,
}

// Brands that activated Resolve but haven't closed any tickets yet.
export const RESOLVE_ACTIVATED_NOT_CLOSING = [
  'Bonn ton',
  'Icy Spicy',
  'Roadster Hospitality',
  'Shree Nawab Restaurant',
  'Sri Annapurna Foods',
  'Vanakkam punjab',
]
