
import JustWatch from 'justwatch';

export async function getStreamingProviders(title: string, year?: string, region: string = 'US') {
  try {
    console.log('Searching for streaming providers:', { title, year, region });
    
    const locale = region.toLowerCase() === 'pl' ? 'pl_PL' : 'en_US';
    const jw = new JustWatch({ locale }); // Initialize with proper locale based on region

    // Search for the movie
    const searchResults = await jw.search({ query: title });
    
    console.log('Search results:', searchResults);

    if (!searchResults?.items?.length) {
      console.log('No results found for:', title);
      return [];
    }

    // Try to find exact match with title and year if provided
    const exactMatch = searchResults.items.find(item => {
      const titleMatch = item.title.toLowerCase() === title.toLowerCase();
      if (!year) return titleMatch;
      return titleMatch && item.original_release_year.toString() === year;
    }) || searchResults.items[0]; // Fallback to first result if no exact match

    if (!exactMatch) {
      console.log('No match found for:', title);
      return [];
    }

    console.log('Found match:', exactMatch);

    // Get offers for the movie
    const details = await jw.getProviders(exactMatch.id);
    
    console.log('Title details:', details);

    // Transform offers to our format
    const availableServices = details?.flatMap(provider => 
      provider.offers?.map(offer => ({
        service: provider.clear_name || provider.provider_id.toString(),
        link: offer.urls?.standard_web || '',
        logo: provider.icon_url ? `https://images.justwatch.com${provider.icon_url}` : undefined,
        available: true,
        startDate: offer.valid_from,
        endDate: offer.valid_to
      })) || []
    ) || [];

    console.log('Available services:', availableServices);
    return availableServices;
  } catch (error) {
    console.error('Error fetching streaming providers:', error);
    return [];
  }
}
