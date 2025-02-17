
import JustWatch from 'justwatch';

export async function getStreamingProviders(title: string, year?: string) {
  try {
    console.log('Searching for streaming providers:', { title, year });
    
    const jw = new JustWatch({ locale: 'en_US' }); // Initialize with locale
    
    // Search for the movie using searchItems method
    const searchResult = await jw.searchItems({
      query: title,
      content_types: ['movie']
    });
    
    console.log('Search results:', searchResult);

    if (!searchResult.items?.length) {
      console.log('No results found for:', title);
      return [];
    }

    // Try to find exact match with title and year if provided
    const exactMatch = searchResult.items.find(item => {
      const titleMatch = item.title.toLowerCase() === title.toLowerCase();
      if (!year) return titleMatch;
      return titleMatch && item.original_release_year.toString() === year;
    }) || searchResult.items[0]; // Fallback to first result if no exact match

    if (!exactMatch) {
      console.log('No match found for:', title);
      return [];
    }

    console.log('Found match:', exactMatch);

    // Get detailed offers using getTitle method with correct parameters
    const details = await jw.getTitle({
      id: exactMatch.id,
      content_type: 'movie'
    });
    
    console.log('Title details:', details);

    // Transform offers to our format
    const availableServices = details.offers?.map(offer => ({
      service: offer.package_short_name || offer.provider_id.toString(),
      link: offer.urls?.standard_web || '',
      logo: offer.icon_url ? `https://images.justwatch.com${offer.icon_url}` : undefined,
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
