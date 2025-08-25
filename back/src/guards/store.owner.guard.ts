import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../entities';
import { StoresService } from '../modules/stores/stores.service';
import { UserRoleEnum } from '../common/enums';

@Injectable()
export class StoreOwnerGuard implements CanActivate {
  constructor(private readonly storesService: StoresService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;
    if (user.role === UserRoleEnum.ADMIN) return true;

    const storeId = request.params.id
      ? Number(request.params.id)
      : request.body.storeId;
    const store = await this.storesService.findOne(storeId);
    if (!store) throw new NotFoundException('Store not found');

    if (store.admin.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to modify this product',
      );
    }

    return true;
  }
}
