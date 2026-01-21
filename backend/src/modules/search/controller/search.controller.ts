import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { SearchService } from '../services/search.service';
import { DynamicFilterDto, SingleProductDto } from '../dto';
import { apiResponse } from 'src/common/apiResponse/api.response';

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

  @Post('filter')
  async filterProducts(
    @Body()
    dto: DynamicFilterDto,
  ) {
    const results = await this.searchService.dynamicProductSearch(dto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { ...results },
    });
  }

  @Post('product')
  async serialProducts(
    @Body()
    dto: SingleProductDto,
  ) {
    const results = await this.searchService.singleProductSearch(dto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { ...results },
    });
  }
}
