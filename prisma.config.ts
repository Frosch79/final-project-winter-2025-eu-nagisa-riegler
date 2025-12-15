export default defineConfig({
  migrations: {
    seed: 'bun·./prisma/seed.ts',
  },
  datasource: {
    url: '[your database URL]',
  },
});
