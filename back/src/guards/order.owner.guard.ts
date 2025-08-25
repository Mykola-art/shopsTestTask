import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../entities';
import { UserRoleEnum } from '../common/enums';
import { ProductsService } from '../modules/products/products.service';
import { OrdersService } from '../modules/orders/orders.service';

@Injectable()
export class OrderOwnerGuard implements CanActivate {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    if (user.role === UserRoleEnum.ADMIN) return true;

    const orderId = request.params.id ? Number(request.params.id) : null;
    if (!orderId) throw new NotFoundException('Order not found');

    const order = await this.ordersService.findOne(orderId);
    if (!orderId) throw new NotFoundException('Order not found');

    const product = await this.productsService.findOne(order.productId);
    if (!product) throw new NotFoundException('Product not found');

    if (product.store.admin.id === user.id || user.id === order.userId) {
      return true;
    }

    throw new ForbiddenException('You are not allowed to modify this product');
  }
}
