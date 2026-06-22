import {
  Body,
  Controller,
  Delete,
  Get,
  Request,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/entities/user';
import { UpdateUserDto } from './dto/update-user.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Public()
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Delete('/delete/:id')
  async deleteUserData(@Param('id') id: string, @Request() req: any) {
    const userId = id;
    const isAdmin = req?.user?.role === 'admin';

    console.log('Delete Request by:', isAdmin ? 'Admin' : 'User');
    let deletionIds;

    if (!isAdmin) {
      // Backup only if the user is deleting themselves
      const backupResponse = await this.userService.backupAndDeleteUser(userId);
      if (backupResponse.status !== 200) {
        return {
          message: 'Backup failed. User not deleted.',
          status: 500,
        };
      }
      deletionIds = backupResponse.deletionIds;
    } else {
      // Fetch only necessary data without backup
      deletionIds = await this.userService.getUserRelatedEntities(userId); // We'll create this helper
    }

    // Optional: only call Retell delete if agent ID exists
    let retellDeleteStatus = 200;
    if (deletionIds.retellAgentId) {
      const retellRes = await this.userService.deleteRetellAgent(
        deletionIds.retellAgentId,
      );
      if (retellRes.status >= 400) {
        retellDeleteStatus = 501;
      }
    }

    // Delete all user-related entities
    const result = await this.userService.deleteUserDataByIds(deletionIds);

    if (result.success) {
      return {
        message: result.message,
        status: retellDeleteStatus === 200 ? 200 : 501,
      };
    } else {
      return {
        message: result.message,
        status: 500,
      };
    }
  }

  // @Delete('/delete/:id')
  // async deleteUserData(@Param('id') id: string) {
  //   console.log('id passed inside payload not blkyy params', id);
  //   const backupResponse = await this.userService.backupAndDeleteUser(id);

  //   if (backupResponse.status === 200) {
  //     const agentDelete = await this.userService.deleteRetellAgent(
  //       backupResponse.deletionIds?.retellAgentId,
  //     );
  //     if (agentDelete !== 500) {
  //       const result = await this.userService.deleteUserDataByIds(
  //         backupResponse.deletionIds,
  //       );
  //       if (result.success) {
  //         return {
  //           message: result.message,
  //           status: 200,
  //         };
  //       } else {
  //         return {
  //           message: result.message,
  //           status: 500,
  //         };
  //       }
  //     } else {
  //       return {
  //         status: 501,
  //         message: 'Retel agent Deletion failed , files are backuped',
  //       };
  //     }
  //   }

  //   return {
  //     message: 'Backup failed. User not deleted.',
  //     status: 500,
  //   };
  // }

  // @Public()
  // @Delete('/:id')
  // deleteUser(@Param('id') id: string) {
  //   return this.userService.deleteUser(id);
  // }

  @Public()
  @Put('deactivate/:id')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':user_id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/users',
        filename: (req, file, cb) => {
          cb(null, Date.now() + `${file.originalname.replace(' ', '')}`);
        },
      }),
    }),
  )
  updateUser(
    @Param('user_id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateUser(userId, updateUserDto, file);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
