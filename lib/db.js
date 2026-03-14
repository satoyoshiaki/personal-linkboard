import Database from "better-sqlite3";
import path from "path";
import { defaultLinks, defaultProfile } from "./site";

const dbPath = path.join(process.cwd(), "data.sqlite");

const globalForDb = globalThis;

function createDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatarUrl TEXT NOT NULL,
      backgroundType TEXT NOT NULL,
      backgroundValue TEXT NOT NULL,
      accentColor TEXT NOT NULL,
      cardColor TEXT NOT NULL,
      textColor TEXT NOT NULL,
      buttonRadius INTEGER NOT NULL,
      seoTitle TEXT NOT NULL,
      seoDescription TEXT NOT NULL,
      faviconUrl TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT DEFAULT '',
      isVisible INTEGER NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  const existingProfile = db
    .prepare("SELECT COUNT(*) as count FROM profile_settings")
    .get();

  if (existingProfile.count === 0) {
    db.prepare(
      `
        INSERT INTO profile_settings (
          id, name, bio, avatarUrl, backgroundType, backgroundValue,
          accentColor, cardColor, textColor, buttonRadius,
          seoTitle, seoDescription, faviconUrl, updatedAt
        ) VALUES (
          1, @name, @bio, @avatarUrl, @backgroundType, @backgroundValue,
          @accentColor, @cardColor, @textColor, @buttonRadius,
          @seoTitle, @seoDescription, @faviconUrl, @updatedAt
        )
      `,
    ).run({
      ...defaultProfile,
      updatedAt: new Date().toISOString(),
    });
  }

  const existingLinks = db.prepare("SELECT COUNT(*) as count FROM links").get();
  if (existingLinks.count === 0) {
    const insertLink = db.prepare(`
      INSERT INTO links (
        title, url, icon, description, isVisible, sortOrder, createdAt, updatedAt
      ) VALUES (
        @title, @url, @icon, @description, @isVisible, @sortOrder, @createdAt, @updatedAt
      )
    `);

    const now = new Date().toISOString();
    const transaction = db.transaction(() => {
      for (const link of defaultLinks) {
        insertLink.run({
          ...link,
          createdAt: now,
          updatedAt: now,
        });
      }
    });
    transaction();
  }

  return db;
}

export const db = globalForDb.__linkboardDb || createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__linkboardDb = db;
}

export function getProfile() {
  return db.prepare("SELECT * FROM profile_settings WHERE id = 1").get();
}

export function updateProfile(input) {
  db.prepare(`
    UPDATE profile_settings
    SET
      name = @name,
      bio = @bio,
      avatarUrl = @avatarUrl,
      backgroundType = @backgroundType,
      backgroundValue = @backgroundValue,
      accentColor = @accentColor,
      cardColor = @cardColor,
      textColor = @textColor,
      buttonRadius = @buttonRadius,
      seoTitle = @seoTitle,
      seoDescription = @seoDescription,
      faviconUrl = @faviconUrl,
      updatedAt = @updatedAt
    WHERE id = 1
  `).run({
    ...input,
    updatedAt: new Date().toISOString(),
  });

  return getProfile();
}

export function getLinks() {
  return db.prepare("SELECT * FROM links ORDER BY sortOrder ASC, id ASC").all();
}

export function createLink(input) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO links (
      title, url, icon, description, isVisible, sortOrder, createdAt, updatedAt
    ) VALUES (
      @title, @url, @icon, @description, @isVisible, @sortOrder, @createdAt, @updatedAt
    )
  `).run({
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return db.prepare("SELECT * FROM links WHERE id = ?").get(result.lastInsertRowid);
}

export function updateLink(id, input) {
  db.prepare(`
    UPDATE links
    SET
      title = @title,
      url = @url,
      icon = @icon,
      description = @description,
      isVisible = @isVisible,
      sortOrder = @sortOrder,
      updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  });

  return db.prepare("SELECT * FROM links WHERE id = ?").get(id);
}

export function deleteLink(id) {
  db.prepare("DELETE FROM links WHERE id = ?").run(id);
}

export function updateLinkOrder(items) {
  const statement = db.prepare(`
    UPDATE links
    SET sortOrder = @sortOrder, updatedAt = @updatedAt
    WHERE id = @id
  `);

  const transaction = db.transaction((payload) => {
    for (const item of payload) {
      statement.run({
        id: item.id,
        sortOrder: item.sortOrder,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  transaction(items);
  return getLinks();
}
