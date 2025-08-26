import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { OrderEntity } from '../../entities';
import { CreateOrderDto, UpdateOrderDto, FindOrdersQueryDto } from './dtos';
import { PaginationResponseDto } from '../../common/dtos';
import { ConvertTimeByTimezone } from '../../utils';
import { AuditService } from '../audit/audit.service';
import { AuditEventType } from '../../common/enums/audit.event.type.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const order = this.orderRepository.create(dto);
    const savedOrder = await this.orderRepository.save(order);
    await this.auditService.log(AuditEventType.CREATE_ORDER, savedOrder.userId);
    return savedOrder;
  }

  async findAll(
    query: FindOrdersQueryDto,
  ): Promise<PaginationResponseDto<OrderEntity>> {
    const { page = 1, limit = 10 } = query;

    let qb = this.orderRepository.createQueryBuilder('order');

    qb = await this.getOrderFilters(qb, query);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(
    id: number,
    dto: UpdateOrderDto,
    userId: number,
  ): Promise<OrderEntity> {
    await this.findOne(id);
    await this.orderRepository.update(id, dto);
    await this.auditService.log(AuditEventType.UPDATE_ORDER, userId);
    return this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id);
    await this.auditService.log(AuditEventType.DELETE_ORDER, userId);
    await this.orderRepository.delete(id);
  }

  async getMyOrders(
    userId: number,
    query: FindOrdersQueryDto,
  ): Promise<PaginationResponseDto<OrderEntity>> {
    const { page = 1, limit = 10 } = query;

    let qb = this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId });

    qb = await this.getOrderFilters(qb, query);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStoreOrders(
    storeId: number,
    query: FindOrdersQueryDto,
  ): Promise<PaginationResponseDto<OrderEntity>> {
    const { page = 1, limit = 10 } = query;

    let qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.product', 'product')
      .where('product.storeId = :storeId', { storeId });

    qb = await this.getOrderFilters(qb, query);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getOrderFilters(
    qb: SelectQueryBuilder<OrderEntity>,
    query: FindOrdersQueryDto,
  ): Promise<SelectQueryBuilder<OrderEntity>> {
    if (query.isAccepted !== undefined) {
      qb.andWhere('order.isAccepted = :isAccepted', {
        isAccepted: query.isAccepted,
      });
    }

    if (query.type) {
      qb.andWhere('order.type = :type', { type: query.type });
    }

    if (query.address) {
      qb.andWhere('LOWER(order.address) LIKE LOWER(:address)', {
        address: `%${query.address}%`,
      });
    }

    let scheduleFrom = query.scheduleFrom;
    let scheduleTo = query.scheduleTo;

    if ((query.scheduleFrom || query.scheduleTo) && query.timezone && query.day) {
      const order = await qb.getOne();
      const storeTz = order?.timezone ?? 'UTC';

      if (query.scheduleFrom) {
        const converted = ConvertTimeByTimezone(
          query.day,
          query.scheduleFrom.toISOString(),
          query.timezone,
          storeTz,
        );
        scheduleFrom = converted.datetime.toJSDate(); 
      }

      if (query.scheduleTo) {
        const converted = ConvertTimeByTimezone(
          query.day,
          query.scheduleTo.toISOString(),
          query.timezone,
          storeTz,
        );
        scheduleTo = converted.datetime.toJSDate();
      }
    }

    if (scheduleFrom) {
      qb.andWhere('order.scheduleAt >= :scheduleFrom', { scheduleFrom });
    }
    if (scheduleTo) {
      qb.andWhere('order.scheduleAt <= :scheduleTo', { scheduleTo });
    }

    return qb;
  }

  async getOrdersByStore(storeId: number): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { product: { store: { id: storeId } } },
    });
    return orders;
  }
}
