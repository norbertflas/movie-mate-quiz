
import JustWatch from 'justwatch';
const jw = new JustWatch();

export async function getStreamingProviders(title: string, year?: string) {
  try {
    console.log('Searching for streaming providers:', { title, year });
    
    // Search for the movie
    const searchResult = await jw.search({ query: title });
    console.log('Search results:', searchResult);

    if (!searchResult.items?.length) {
      console.log('No results found for:', title);
      return [];
    }

    // Try to find exact match with title and year if provided
    const exactMatch = searchResult.items.find(item => {
      const titleMatch = item.title.toLowerCase() === title.toLowerCase();
      if (!year) return titleMatch;
      const releaseYear = new Date(item.original_release_year).getFullYear().toString();
      return titleMatch && releaseYear === year;
    }) || searchResult.items[0]; // Fallback to first result if no exact match

    if (!exactMatch) {
      console.log('No match found for:', title);
      return [];
    }

    console.log('Found match:', exactMatch);

    // Get detailed offers
    const details = await jw.getTitle('movie', exactMatch.id);
    console.log('Title details:', details);

    // Transform offers to our format
    const availableServices = details.offers?.map(offer => ({
      service: offer.provider_id.toString(),
      link: offer.urls?.standard_web || '',
      logo: `https://images.justwatch.com${offer.icon_url}`,
      available: true,
      startDate: offer.valid_from,
      endDate: offer.valid_to
    })) || [];

    console.log('Available services:', availableServices);
    return availableServices;
  } catch (error) {
    console.error('Error fetching streaming providers:', error);
    return [];
  }
}
