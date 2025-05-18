import { QueryRunner } from 'typeorm';
import { InitialMigration1747500377743 } from './1747500377743-InitialMigration';

describe('InitialMigration1747500377743', () => {
  let migration: InitialMigration1747500377743;
  const queryRunner = {} as QueryRunner;

  beforeAll(() => {
    migration = new InitialMigration1747500377743();
  });

  it('up should resolve without errors', async () => {
    await expect(migration.up(queryRunner)).resolves.toBeUndefined();
  });

  it('down should resolve without errors', async () => {
    await expect(migration.down(queryRunner)).resolves.toBeUndefined();
  });
});
