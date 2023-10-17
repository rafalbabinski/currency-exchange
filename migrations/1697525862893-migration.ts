import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1697525862893 implements MigrationInterface {
  name = "migration1697525862893";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "example-model"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
