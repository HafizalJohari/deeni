export const hadithCollections = [
  { id: 'bukhari', name: 'Sahih Bukhari' },
  { id: 'muslim', name: 'Sahih Muslim' },
  { id: 'abudawud', name: 'Sunan Abu Dawud' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi' },
  { id: 'nasai', name: 'Sunan an-Nasai' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah' },
  { id: 'malik', name: 'Muwatta Malik' },
  { id: 'other', name: 'Other' },
];

export const getCollectionName = (collection: string) => {
  const found = hadithCollections.find(c => c.id === collection);
  return found ? found.name : collection;
}; 