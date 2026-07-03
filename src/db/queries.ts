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

export interface Service {
  id: number;
  name: string;
  category: string;
  desc: string;
  price: string;
  mrp_price: string | null;
  offer_price: string | null;
  img: string;
  sort: number;
  created_at: string;
}

export async function getAllServices(): Promise<Service[]> {
  try {
    const response = await db.execute(
      "SELECT id, name, category, desc, price, mrp_price, offer_price, img, sort, created_at FROM services ORDER BY sort ASC, id ASC"
    );
    
    return response.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      category: String(row.category),
      desc: String(row.desc),
      price: String(row.price),
      mrp_price: row.mrp_price ? String(row.mrp_price) : null,
      offer_price: row.offer_price ? String(row.offer_price) : null,
      img: String(row.img),
      sort: Number(row.sort ?? 0),
      created_at: String(row.created_at),
    }));
  } catch (error) {
    console.error("Failed to query services from database:", error);
    return [];
  }
}

export async function getServiceById(id: number): Promise<Service | null> {
  try {
    const response = await db.execute({
      sql: "SELECT id, name, category, desc, price, mrp_price, offer_price, img, sort, created_at FROM services WHERE id = ?",
      args: [id],
    });
    
    if (response.rows.length === 0) return null;
    const row = response.rows[0];
    
    return {
      id: Number(row.id),
      name: String(row.name),
      category: String(row.category),
      desc: String(row.desc),
      price: String(row.price),
      mrp_price: row.mrp_price ? String(row.mrp_price) : null,
      offer_price: row.offer_price ? String(row.offer_price) : null,
      img: String(row.img),
      sort: Number(row.sort ?? 0),
      created_at: String(row.created_at),
    };
  } catch (error) {
    console.error(`Failed to query service with id ${id} from database:`, error);
    return null;
  }
}

export interface Feedback {
  id: number;
  name: string;
  rating: number;
  quote: string;
  location: string | null;
  service: string | null;
  approved: number;
  created_at: string;
}

export async function getApprovedFeedbacks(): Promise<Feedback[]> {
  try {
    const response = await db.execute(
      "SELECT id, name, rating, quote, location, service, approved, created_at FROM feedbacks WHERE approved = 1 ORDER BY created_at DESC"
    );
    
    return response.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      rating: Number(row.rating),
      quote: String(row.quote),
      location: row.location ? String(row.location) : null,
      service: row.service ? String(row.service) : null,
      approved: Number(row.approved),
      created_at: String(row.created_at),
    }));
  } catch (error) {
    console.error("Failed to query approved feedbacks:", error);
    return [];
  }
}

export async function getAllFeedbacks(): Promise<Feedback[]> {
  try {
    const response = await db.execute(
      "SELECT id, name, rating, quote, location, service, approved, created_at FROM feedbacks ORDER BY created_at DESC"
    );
    
    return response.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      rating: Number(row.rating),
      quote: String(row.quote),
      location: row.location ? String(row.location) : null,
      service: row.service ? String(row.service) : null,
      approved: Number(row.approved),
      created_at: String(row.created_at),
    }));
  } catch (error) {
    console.error("Failed to query all feedbacks:", error);
    return [];
  }
}

export async function submitFeedbackAction(name: string, rating: number, quote: string, location?: string, service?: string): Promise<boolean> {
  try {
    await db.execute({
      sql: "INSERT INTO feedbacks (name, rating, quote, location, service, approved) VALUES (?, ?, ?, ?, ?, 1)", // Auto-approve for demo/simplicity, or 0 if moderation is desired. Let's auto-approve 1.
      args: [name, rating, quote, location ?? null, service ?? null],
    });
    return true;
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return false;
  }
}

