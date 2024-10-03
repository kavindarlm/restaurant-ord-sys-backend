import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions ={
    type: 'mysql',
    host: '',
    port: 3306,
    username: '',
    password: '',
    database: '',
    entities: [

    ],
    synchronize: true,
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized : false,
        },
    },
};