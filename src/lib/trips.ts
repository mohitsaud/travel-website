export type Trip = {
  slug: string;
  title: string;
  region: string;
  style: "Trekking" | "Culture" | "Adventure";
  duration: number;
  difficulty: "Moderate" | "Challenging" | "Introductory";
  priceFrom: number;
  altitude: string;
  image: string;
  imageAlt: string;
  summary: string;
  itinerary: string[];
  departure: string;
};

export const trips: Trip[] = [
  {
    slug: "everest-base-camp",
    title: "Everest Base Camp Trek",
    region: "Khumbu · Everest",
    style: "Trekking",
    duration: 15,
    difficulty: "Challenging",
    priceFrom: 2650,
    altitude: "5,364 m",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=85",
    imageAlt: "Snow-covered Himalayan peaks rising above the clouds",
    summary: "Walk beneath the world’s highest peaks, through Sherpa villages and glacial valleys, to the foot of Everest.",
    itinerary: ["Arrive in Kathmandu and meet your guide", "Fly to Lukla and walk to Phakding", "Acclimatize in Namche Bazaar", "Cross high valleys through Dingboche and Lobuche", "Reach Everest Base Camp and Kala Patthar", "Return by trail to Lukla and Kathmandu"],
    departure: "Oct 10, 2026",
  },
  {
    slug: "annapurna-base-camp",
    title: "Annapurna Base Camp",
    region: "Annapurna Sanctuary",
    style: "Trekking",
    duration: 12,
    difficulty: "Moderate",
    priceFrom: 1750,
    altitude: "4,130 m",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1300&q=85",
    imageAlt: "Layered Himalayan ridges at sunrise",
    summary: "Follow stone stairways and rhododendron forest into a vast mountain amphitheatre ringed by Annapurna peaks.",
    itinerary: ["Arrive in Kathmandu; travel to Pokhara", "Begin the trail through Ghandruk", "Climb through Chhomrong and Bamboo", "Enter the Annapurna Sanctuary", "Watch first light at base camp", "Descend through Jhinu hot springs to Pokhara"],
    departure: "Oct 18, 2026",
  },
  {
    slug: "langtang-valley",
    title: "Langtang Valley & Kyanjin Gompa",
    region: "Langtang National Park",
    style: "Trekking",
    duration: 11,
    difficulty: "Moderate",
    priceFrom: 1145,
    altitude: "4,773 m",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1300&q=85",
    imageAlt: "Mountain summit under a clear deep-blue sky",
    summary: "A quieter Himalayan trail of yak pastures, Tamang hospitality and close-up glacier views, close to Kathmandu.",
    itinerary: ["Drive from Kathmandu to Syabrubesi", "Follow the river through bamboo forest", "Reach the alpine village of Langtang", "Explore Kyanjin Gompa and the glacier", "Optional sunrise climb to Tserko Ri", "Return through the valley to Kathmandu"],
    departure: "Oct 24, 2026",
  },
  {
    slug: "manaslu-circuit",
    title: "Manaslu Circuit & Larkya La",
    region: "Manaslu Conservation Area",
    style: "Trekking",
    duration: 15,
    difficulty: "Challenging",
    priceFrom: 1490,
    altitude: "5,106 m",
    image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1300&q=85",
    imageAlt: "Dramatic mountain range in the Nepal Himalaya",
    summary: "Circle the eighth-highest mountain through remote villages, deep river gorges and a high Himalayan pass.",
    itinerary: ["Drive to the trailhead at Machha Khola", "Walk north through Budhi Gandaki gorge", "Acclimatize in Samagaun beneath Manaslu", "Cross Larkya La before descending to Bimthang", "Walk through pine forest to Dharapani", "Return to Kathmandu"],
    departure: "Nov 02, 2026",
  },
  {
    slug: "nepal-cultural-journey",
    title: "Nepal Cultural Journey",
    region: "Kathmandu · Chitwan · Pokhara",
    style: "Culture",
    duration: 10,
    difficulty: "Introductory",
    priceFrom: 1580,
    altitude: "1,400 m",
    image: "https://images.unsplash.com/photo-1544735716-1a4b9608d6f7?auto=format&fit=crop&w=1300&q=85",
    imageAlt: "Traditional Nepalese temple architecture in Kathmandu",
    summary: "Discover living heritage, village life, lowland wildlife and lake-country views on a thoughtful first journey.",
    itinerary: ["Explore Kathmandu’s old squares and courtyards", "Visit Patan and Bhaktapur with a local guide", "Travel to Chitwan for a community-led wildlife walk", "Continue to Pokhara and the Phewa lakeside", "Watch sunrise over the Annapurna range", "Return to Kathmandu for departure"],
    departure: "Nov 08, 2026",
  },
  {
    slug: "everest-helicopter-day",
    title: "Everest Panorama by Helicopter",
    region: "Everest Region",
    style: "Adventure",
    duration: 1,
    difficulty: "Introductory",
    priceFrom: 890,
    altitude: "5,545 m",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1300&q=85",
    imageAlt: "Sunrise light moving across a Himalayan valley",
    summary: "A full Himalayan horizon in a day, with a mountain landing and breakfast stop above the clouds.",
    itinerary: ["Early pickup and flight briefing in Kathmandu", "Fly east over the mid-hills into the Khumbu", "Land near Everest for a short acclimatized stop", "Breakfast with mountain views before the return flight"],
    departure: "Daily, weather permitting",
  },
];

export function getTrip(slug: string) {
  return trips.find((trip) => trip.slug === slug);
}