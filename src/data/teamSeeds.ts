/** FIFA ranking order → tournament seed (1 = strongest, 48 = weakest). */

export const TEAM_SEED_BY_SLUG: Record<string, number> = {
  'argentina': 1,
  'spain': 2,
  'france': 3,
  'england': 4,
  'portugal': 5,
  'brazil': 6,
  'morocco': 7,
  'netherlands': 8,
  'belgium': 9,
  'germany': 10,
  'croatia': 11,
  'colombia': 12,
  'mexico': 13,
  'senegal': 14,
  'uruguay': 15,
  'usa': 16,
  'japan': 17,
  'switzerland': 18,
  'iran': 19,
  'turkey': 20,
  'ecuador': 21,
  'austria': 22,
  'south-korea': 23,
  'australia': 24,
  'algeria': 25,
  'egypt': 26,
  'canada': 27,
  'norway': 28,
  'cote-d-ivoire': 29,
  'panama': 30,
  'sweden': 31,
  'czechia': 32,
  'paraguay': 33,
  'scotland': 34,
  'tunisia': 35,
  'dr-congo': 36,
  'uzbekistan': 37,
  'qatar': 38,
  'iraq': 39,
  'south-africa': 40,
  'saudi-arabia': 41,
  'jordan': 42,
  'bosnia-and-herzegovina': 43,
  'cape-verde': 44,
  'ghana': 45,
  'curacao': 46,
  'haiti': 47,
  'new-zealand': 48,
}

export function cardsRequiredForSeed(seed: number): number {
  if (seed <= 6) return 12  // Elite: Argentina, Spain, France, England, Portugal, Brazil
  if (seed <= 10) return 4  // Strong: Morocco, Netherlands, Belgium, Germany
  if (seed <= 17) return 3  // Contender: Croatia, Colombia, Mexico, Senegal, Uruguay, USA, Japan
  if (seed <= 27) return 2  // Dark horse: Switzerland through Canada
  return 1                  // Underdog: everyone else
}
