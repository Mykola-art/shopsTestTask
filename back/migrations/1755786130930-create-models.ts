import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateModels1755784610167 implements MigrationInterface {
    name = 'CreateModels1755784610167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- ENUMS ---
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TYPE "order_type_enum" AS ENUM('PICKUP', 'DELIVERY')`);
        await queryRunner.query(`CREATE TYPE "audit_event_type_enum" AS ENUM('LOGIN', 'LOGOUT', 'REGISTRER_USER', 'FAILED_LOGIN', 'CREATE_STORE', 'UPDATE_STORE', 'DELETE_STORE', 'CREATE_PRODCUT', 'UPDATE_PRODCUT', 'DELETE_PRODCUT', 'CREATE_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER')`);

        // --- USERS ---
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'email', type: 'varchar', isUnique: true },
                { name: 'password', type: 'varchar' },
                { name: 'role', type: 'user_role_enum', default: `'USER'` },
                { name: 'refreshToken', type: 'text', isNullable: true },
                { name: 'failedLoginAttempts', type: 'int', default: 0 },
                { name: 'lockoutUntil', type: 'timestamptz', isNullable: true }
            ]
        }), true);

        // --- STORES ---
        await queryRunner.createTable(new Table({
            name: 'stores',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'slug', type: 'varchar', isUnique: true },
                { name: 'name', type: 'varchar' },
                { name: 'address', type: 'varchar' },
                { name: 'timezone', type: 'varchar' },
                { name: 'lat', type: 'decimal', precision: 10, scale: 6 },
                { name: 'lng', type: 'decimal', precision: 10, scale: 6 },
                { name: 'operatingHours', type: 'jsonb', isNullable: true },
                { name: 'adminId', type: 'int', isNullable: true },
                { name: 'createdAt', type: 'timestamptz', default: 'now()' },
                { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
            ]
        }), true);

        await queryRunner.createForeignKey("stores", new TableForeignKey({
            columnNames: ["adminId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // --- PRODUCTS ---
        await queryRunner.createTable(new Table({
            name: 'products',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'storeId', type: 'int' },
                { name: 'name', type: 'varchar' },
                { name: 'price', type: 'decimal' },
                { name: 'description', type: 'varchar', isNullable: true },
                { name: 'availability', type: 'jsonb', isNullable: true },
                { name: 'modifiers', type: 'jsonb', isNullable: true },
                { name: 'cacheTTL', type: 'int', default: 3600 },
                { name: 'createdAt', type: 'timestamptz', default: 'now()' },
                { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
            ]
        }), true);

        await queryRunner.createForeignKey("products", new TableForeignKey({
            columnNames: ["storeId"],
            referencedColumnNames: ["id"],
            referencedTableName: "stores",
            onDelete: "CASCADE"
        }));

        // --- ORDERS ---
        await queryRunner.createTable(new Table({
            name: 'orders',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'userId', type: 'int' },
                { name: 'productId', type: 'int' },
                { name: 'type', type: 'order_type_enum', default: `'PICKUP'` },
                { name: 'scheduleAt', type: 'timestamptz' },
                { name: 'address', type: 'varchar', isNullable: true },
                { name: 'timezone', type: 'varchar' },
                { name: 'isAccepted', type: 'boolean', default: false },
                { name: 'modifiers', type: 'jsonb', isNullable: true },
                { name: 'createdAt', type: 'timestamptz', default: 'now()' },
                { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
            ]
        }), true);

        await queryRunner.createForeignKeys("orders", [
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["productId"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "CASCADE"
            })
        ]);

        // --- AUDIT LOGS ---
        await queryRunner.createTable(new Table({
            name: 'audit_logs',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'eventType', type: 'audit_event_type_enum' },
                { name: 'userId', type: 'int', isNullable: true },
                { name: 'metadata', type: 'jsonb', isNullable: true },
                { name: 'createdAt', type: 'timestamptz', default: 'now()' }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('audit_logs');
        await queryRunner.dropTable('orders');
        await queryRunner.dropTable('products');
        await queryRunner.dropTable('stores');
        await queryRunner.dropTable('users');

        await queryRunner.query(`DROP TYPE "audit_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "order_type_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
