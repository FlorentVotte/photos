/**
 * Migration script: Import JSON data to SQLite database
 * Run once to migrate from JSON files to database storage
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

// Database setup
const dbPath = process.env.NODE_ENV === "production" && fs.existsSync("/app/data")
  ? "/app/data/photobook.db"
  : "./photobook.db";

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

interface TokenJson {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

interface GalleryJson {
  albumId?: string;
  albumName?: string;
  url?: string;
  featured: boolean;
  type: "private" | "public";
}

async function migrateTokens() {
  const tokenPaths = [
    "/app/data/adobe-tokens.json",
    "./data/adobe-tokens.json",
  ];

  for (const tokenPath of tokenPaths) {
    if (fs.existsSync(tokenPath)) {
      console.log(`Found tokens at: ${tokenPath}`);
      const data: TokenJson = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));

      await prisma.adobeToken.upsert({
        where: { id: "default" },
        update: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || null,
          expiresAt: new Date(data.expires_at),
        },
        create: {
          id: "default",
          accessToken: data.access_token,
          refreshToken: data.refresh_token || null,
          expiresAt: new Date(data.expires_at),
        },
      });
      console.log("  Token migrated successfully");
      return;
    }
  }

  console.log("No token file found");
}

async function migrateGalleries() {
  const galleryPaths = [
    "/app/data/galleries.json",
    "./data/galleries.json",
  ];

  for (const galleryPath of galleryPaths) {
    if (fs.existsSync(galleryPath)) {
      console.log(`Found galleries at: ${galleryPath}`);
      const galleries: GalleryJson[] = JSON.parse(fs.readFileSync(galleryPath, "utf-8"));

      for (const gallery of galleries) {
        const id = gallery.albumId || gallery.url || `gallery-${Date.now()}`;

        await prisma.gallery.upsert({
          where: { id },
          update: {
            type: gallery.type,
            url: gallery.url || null,
            albumId: gallery.albumId || null,
            albumName: gallery.albumName || null,
            featured: gallery.featured,
          },
          create: {
            id,
            type: gallery.type,
            url: gallery.url || null,
            albumId: gallery.albumId || null,
            albumName: gallery.albumName || null,
            featured: gallery.featured,
          },
        });
        console.log(`  Gallery migrated: ${gallery.albumName || gallery.url}`);
      }
      return;
    }
  }

  console.log("No galleries file found");
}

async function main() {
  console.log("Starting JSON to Database migration...\n");
  console.log(`Database path: ${dbPath}\n`);

  try {
    await migrateTokens();
    console.log("");
    await migrateGalleries();
    console.log("\nMigration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
