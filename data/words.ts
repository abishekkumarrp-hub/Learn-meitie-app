export interface Word {
  id: number;
  meitei: string;
  roman: string;
  english: string;
}

export const beginnerWords: Word[] = [
  { id: 1, meitei: "ꯍꯥꯏ", roman: "Hai", english: "Hello" },
  { id: 2, meitei: "ꯅꯨꯡꯉꯥꯏ", roman: "Nungngai", english: "Good" },
  { id: 3, meitei: "ꯑꯣꯏꯅ", roman: "Oina", english: "Water" },
  { id: 4, meitei: "ꯆꯥꯛ", roman: "Chaak", english: "Rice" },
  { id: 5, meitei: "ꯃꯇꯝ", roman: "Matam", english: "Time" },
  { id: 6, meitei: "ꯂꯩꯄꯥꯛ", roman: "Leipak", english: "Country" },
  { id: 7, meitei: "ꯁꯥꯅꯥ", roman: "Sana", english: "Sun" },
  { id: 8, meitei: "ꯊꯥ", roman: "Tha", english: "Moon" },
  { id: 9, meitei: "ꯏꯃꯥ", roman: "Ima", english: "Mother" },
  { id: 10, meitei: "ꯏꯄꯥ", roman: "Ipa", english: "Father" },
  { id: 11, meitei: "ꯅꯥ", roman: "Na", english: "You" },
  { id: 12, meitei: "ꯑꯩ", roman: "Ei", english: "I" },
  { id: 13, meitei: "ꯃꯍꯥꯛ", roman: "Mahak", english: "He/She" },
  { id: 14, meitei: "ꯃꯆꯥ", roman: "Macha", english: "Child" },
  { id: 15, meitei: "ꯌꯨꯝ", roman: "Yum", english: "House" },
  { id: 16, meitei: "ꯂꯝ", roman: "Lam", english: "Road" },
  { id: 17, meitei: "ꯄꯥꯝꯕꯤ", roman: "Pambi", english: "Bread" },
  { id: 18, meitei: "ꯈꯣꯡ", roman: "Khong", english: "Leg" },
  { id: 19, meitei: "ꯍꯨꯏ", roman: "Hui", english: "Dog" },
  { id: 20, meitei: "ꯁꯥ", roman: "Sa", english: "Meat" },
];

export const intermediateWords: Word[] = [];
export const advancedWords: Word[] = [];
