import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const COMMENTS_TABLE = "comments";
export const COMMENT_IMAGES_BUCKET = "comment-images";
export const AUTHOR_STORAGE_KEY = "bistrup-author";

export interface Comment {
  id: string;
  parent_id: string | null;
  page_path: string;
  x_percent: number;
  y_percent: number;
  anchor_selector: string | null;
  anchor_offset_x: number;
  anchor_offset_y: number;
  text: string;
  image_url: string | null;
  author: string;
  created_at: string;
  replies?: Comment[];
}

export function buildCommentTree(flat: Comment[]): Comment[] {
  const replyMap = new Map<string, Comment[]>();
  const topLevel: Comment[] = [];

  for (const c of flat) {
    if (c.parent_id) {
      const list = replyMap.get(c.parent_id);
      if (list) list.push(c);
      else replyMap.set(c.parent_id, [c]);
    } else {
      topLevel.push(c);
    }
  }

  return topLevel.map((c) => ({
    ...c,
    replies: replyMap.get(c.id) || [],
  }));
}
