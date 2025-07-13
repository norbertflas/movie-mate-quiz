
import JustWatch from 'justwatch';

export async function getStreamingProviders(title: string, year?: string, region: string = 'US') {
  try {
    console.log('Searching for streaming providers:', { title, year, region });
    
    const locale = region.toLowerCase() === 'pl' ? 'pl_PL' : 'en_US';
    const jw = new JustWatch({ locale }); // Inicjalizacja z odpowiednim językiem na podstawie regionu

    // Wyszukaj film
    const searchResults = await jw.search({ query: title });
    
    console.log('Search results:', searchResults);

    if (!searchResults?.items?.length) {
      console.log('No results found for:', title);
      return [];
    }

    // Próbuj znaleźć dokładne dopasowanie z tytułem i rokiem jeśli podany
    const exactMatch = searchResults.items.find(item => {
      const titleMatch = item.title.toLowerCase() === title.toLowerCase();
      if (!year) return titleMatch;
      return titleMatch && item.original_release_year.toString() === year;
    }) || searchResults.items[0]; // Fallback do pierwszego wyniku jeśli nie ma dokładnego dopasowania

    if (!exactMatch) {
      console.log('No match found for:', title);
      return [];
    }

    console.log('Found match:', exactMatch);

    // Pobierz oferty dla filmu
    const details = await jw.getProviders(exactMatch.id);
    
    console.log('Title details:', details);

    // Przekształć oferty do naszego formatu
    const availableServices = details?.flatMap(provider => 
      provider.offers?.map(offer => ({
        service: provider.clear_name || provider.provider_id.toString(),
        link: offer.urls?.standard_web || '',
        logo: provider.icon_url ? `https://images.justwatch.com${provider.icon_url}` : undefined,
        available: true,
        startDate: offer.valid_from,
        endDate: offer.valid_to,
        type: offer.monetization_type || 'sub' // Dodanie informacji o typie (subskrypcja, wypożyczenie, etc.)
      })) || []
    ) || [];

    // Filtrowanie duplikatów i sprawdzanie poprawności danych
    const uniqueServices = Array.from(
      new Map(availableServices.map(item => [item.service.toLowerCase(), item])).values()
    );

    console.log('Available services:', uniqueServices);
    return uniqueServices;
  } catch (error) {
    console.error('Error fetching streaming providers:', error);
    return [];
  }
}
