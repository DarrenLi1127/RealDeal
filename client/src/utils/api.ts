const API = "http://localhost:8080"; // adjust if backend runs elsewhere

/** toggle like; returns { liked, likes } */
export async function toggleLike(postId: string, userId: string) {
  const r = await fetch(`${API}/api/posts/${postId}/like?userId=${userId}`, {
    method: "POST",
  });
  if (!r.ok) throw new Error("Like request failed");
  return r.json() as Promise<{ liked: boolean; likes: number }>;
}

/** toggle star; returns { starred, stars } */
export async function toggleStar(postId: string, userId: string) {
  const r = await fetch(`${API}/api/posts/${postId}/star?userId=${userId}`, {
    method: "POST",
  });
  if (!r.ok) throw new Error("Star request failed");
  return r.json() as Promise<{ starred: boolean; stars: number }>;
}
