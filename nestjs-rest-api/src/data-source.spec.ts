import { DataSource } from 'typeorm';
import AppDataSource from './data-source';

describe('AppDataSource', () => {
  it('should be an instance of DataSource', () => {
    expect(AppDataSource).toBeInstanceOf(DataSource);
  });

  it('should have correct database options', () => {
    const opts = AppDataSource.options as any;
    expect(opts.type).toBe('postgres');
    expect(typeof opts.host).toBe('string');
    expect(typeof opts.port).toBe('number');
    expect(typeof opts.username).toBe('string');
    expect(typeof opts.password).toBe('string');
    expect(typeof opts.database).toBe('string');
    expect(Array.isArray(opts.entities)).toBe(true);
    expect(opts.entities[0]).toContain('.entity');
    expect(Array.isArray(opts.migrations)).toBe(true);
    expect(opts.migrations[0]).toContain('migrations');
  });
});
