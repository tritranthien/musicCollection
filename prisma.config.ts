import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "mongodb+srv://seven007:Seven007@cluster0.grysdc2.mongodb.net/music_collection?retryWrites=true&w=majority",
  },
});
