import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../services/search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    if (!query) {
      return { results: [], total: 0 };
    }

    const results = await this.searchService.search(query);

    return {
      results: results,
      total: results.length,
      query: query,
    };
  }

  @Get('suggest')
  async suggest(@Query('q') query: string) {
    const suggestions = await this.searchService.getSuggestions(query);
    return {
      suggestions: suggestions,
      query: query,
    };
  }
}
