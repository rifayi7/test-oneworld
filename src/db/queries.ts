import "server-only";
import { db } from "./client";

export interface Package {
  id: number;
  slug: string;
  title: string;
  price: number;
  blurb: string;
  sort: number;
  published: number;
}

export async function getPublishedPackages(): Promise<Omit<Package, "sort" | "published" | "id">[]> {
  try {
    const response = await db.execute(
      "SELECT slug, title, price, blurb FROM packages WHERE published = 1 ORDER BY sort ASC"
    );
    
    return response.rows.map((row) => ({
      slug: String(row.slug),
      title: String(row.title),
      price: Number(row.price),
      blurb: String(row.blurb),
    }));
  } catch (error) {
    console.error("Failed to query published packages from database:", error);
    return [];
  }
}
