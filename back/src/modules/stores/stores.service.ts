import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { StoreEntity } from '../../entities';
import {
  CreateStoreDto,
  GetActiveStoresQueryDto,
  UpdateStoreDto,
} from './dtos';
import {
  PaginationResponseDto,
  ResponseStoreDashboardDto,
} from '../../common/dtos';
import { FindStoresQueryDto } from './dtos/find.stores.query.dto';
import { ConvertTimeByTimezone } from '../../utils';
import { AuditService } from '../audit/audit.service';
import { AuditEventType } from '../../common/enums/audit.event.type.enum';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    private readonly auditService: AuditService,
    private readonly productService: ProductsService,
    private readonly orderService: OrdersService,
  ) {}

  async create(adminId: number, dto: CreateStoreDto): Promise<StoreEntity> {
    const store = this.storeRepository.create({
      ...dto,
      admin: { id: adminId } as any,
    });
    await this.auditService.log(AuditEventType.CREATE_STORE, adminId);
    return this.storeRepository.save(store);
  }

  async findAll(
    query: FindStoresQueryDto,
  ): Promise<PaginationResponseDto<StoreEntity>> {
    const { page, limit, timezone, name, address, day, from, to } = query;
    const qb = this.storeRepository.createQueryBuilder('store');

    if (name) {
      qb.andWhere('LOWER(store.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }
    if (address) {
      qb.andWhere('LOWER(store.address) LIKE LOWER(:address)', {
        address: `%${address}%`,
      });
    }

    let fromInStoreTz = from;
    let toInStoreTz = to;
    if (timezone && day && from && to) {
      const store = await qb.getOne();
      const storeTimezone = store?.timezone;
      if (storeTimezone) {
        fromInStoreTz = ConvertTimeByTimezone(from, timezone, storeTimezone);
        toInStoreTz = ConvertTimeByTimezone(to, timezone, storeTimezone);
      }
    }

    if (day && from && to) {
      qb.andWhere(
        `store.operatingHours -> :day ->> 'from' <= :from AND store.operatingHours -> :day ->> 'to' >= :to`,
        { day, from: fromInStoreTz, to: toInStoreTz },
      );
    }

    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      meta: {
        totalPages: Math.ceil(total / limit),
        page,
        pageSize: limit,
        total,
      },
    };
  }

  async findOne(id: number): Promise<StoreEntity> {
    const store = await this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.admin', 'admin')
      .addSelect(['admin.id', 'admin.email'])
      .where('store.id = :id', { id })
      .getOne();

    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async getMyStores(userId: number): Promise<StoreEntity[]> {
    return this.storeRepository.find({
      where: { admin: { id: userId } },
    });
  }

  async getActiveStores(
    query: GetActiveStoresQueryDto,
  ): Promise<PaginationResponseDto<StoreEntity>> {
    const { timezone, time, page, limit } = query;
    const day = DateTime.now().setZone(timezone).toFormat('EEEE');

    const qb = this.storeRepository.createQueryBuilder('store');
    const store = await qb.getOne();
    const storeTimezone = store?.timezone;

    let timeInStore = time;
    if (timezone && storeTimezone) {
      timeInStore = ConvertTimeByTimezone(time, timezone, storeTimezone);
    }

    qb.andWhere(
      `store.operatingHours -> :day ->> 'from' <= :time AND store.operatingHours -> :day ->> 'to' >= :time`,
      { day, time: timeInStore },
    );

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

  async update(
    id: number,
    dto: UpdateStoreDto,
    userId: number,
  ): Promise<StoreEntity> {
    const store = await this.findOne(id);
    const updated = Object.assign(store, dto);
    await this.auditService.log(AuditEventType.UPDATE_STORE, userId);
    return this.storeRepository.save(updated);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id);
    await this.auditService.log(AuditEventType.DELETE_STORE, userId);
    await this.storeRepository.delete(id);
  }

  async getStoreStats(storeId: number): Promise<ResponseStoreDashboardDto> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const [productsCount, orders] = await Promise.all([
      this.productService.getCountByStore(storeId),
      this.orderService.getOrdersByStore(storeId),
    ]);

    const now = DateTime.now();
    let accepted = 0;
    let pending = 0;
    let past = 0;
    let upcoming = 0;

    orders.forEach((order) => {
      if (order.isAccepted) accepted++;
      else pending++;

      const scheduleAt = DateTime.fromJSDate(order.scheduleAt);
      if (scheduleAt <= now) past++;
      else upcoming++;
    });

    return {
      storeId,
      productsCount,
      ordersCount: orders.length,
      acceptedOrders: accepted,
      pendingOrders: pending,
      pastOrders: past,
      upcomingOrders: upcoming,
    };
  }
}
