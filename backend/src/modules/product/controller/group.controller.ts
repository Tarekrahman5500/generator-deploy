import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  // UseGuards,
} from '@nestjs/common';
import { GroupService } from '../service';
import { GroupCreateDto, GroupUpdateDto } from '../dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
// import { AuthGuard } from 'src/auth/guard';

@Controller('group')
// @UseGuards(AuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // ------------------------------------------------------------
  // Create Group
  // ------------------------------------------------------------
  @Post()
  async createGroup(@Body() dto: GroupCreateDto) {
    const group = await this.groupService.createGroup(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { group },
    });
  }

  // ------------------------------------------------------------
  // Update Group
  // ------------------------------------------------------------
  @Patch()
  async updateGroup(@Body() dto: GroupUpdateDto) {
    const group = await this.groupService.updateGroup(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { group },
    });
  }

  // ------------------------------------------------------------
  // Get All Groups
  // ------------------------------------------------------------
  @Get()
  async getAllGroups() {
    const groups = await this.groupService.findAllGroups();
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { groups },
    });
  }

  // ------------------------------------------------------------
  // Get Group by ID
  // ------------------------------------------------------------
  @Get(':id')
  async getGroup(@Param('id') id: string) {
    const group = await this.groupService.findGroupById(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { group },
    });
  }

  // ------------------------------------------------------------
  // Get Groups by Category ID
  // ------------------------------------------------------------
  @Get('category/:categoryId')
  async getGroupsByCategory(@Param('categoryId') categoryId: string) {
    const groups = await this.groupService.findGroupsByCategoryId(categoryId);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { groups },
    });
  }

  // ------------------------------------------------------------
  // Delete Group
  // ------------------------------------------------------------
  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    await this.groupService.deleteGroup(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'Group deleted successfully' },
    });
  }
}
