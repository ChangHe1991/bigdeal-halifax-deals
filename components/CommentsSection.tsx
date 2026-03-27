"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type CommentItem = {
  id: string;
  productId: number;
  author: string;
  text: string;
  recommend: boolean;
  createdAt: string;
};

type CommentsSectionProps = {
  productId: number;
  itemName: string;
};

const storageKey = "grocery-deals-comments";

export default function CommentsSection({ productId, itemName }: CommentsSectionProps) {
  const [allComments, setAllComments] = useState<CommentItem[]>([]);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [recommend, setRecommend] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as CommentItem[];
      setAllComments(parsed);
    } catch {
      setAllComments([]);
    }
  }, []);

  const productComments = useMemo(
    () =>
      allComments
        .filter((comment) => comment.productId === productId)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [allComments, productId]
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    const newComment: CommentItem = {
      id: crypto.randomUUID(),
      productId,
      author: author.trim() || "Anonymous",
      text: trimmedText,
      recommend,
      createdAt: new Date().toISOString(),
    };

    const next = [newComment, ...allComments];
    setAllComments(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setText("");
    setRecommend(true);
  };

  return (
    <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold">Community comments</h2>
      <p className="mb-4 text-sm text-gray-600">
        Share tips or recommendations for {itemName}.
      </p>

      <form onSubmit={onSubmit} className="mb-5 space-y-3">
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Comment or recommendation..."
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={recommend}
            onChange={(event) => setRecommend(event.target.checked)}
            className="h-4 w-4"
          />
          I recommend this product
        </label>
        <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
          Post comment
        </button>
      </form>

      <div className="space-y-3">
        {productComments.map((comment) => (
          <article key={comment.id} className="rounded-lg border border-gray-200 p-3">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{comment.author}</p>
              <p className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm text-gray-800">{comment.text}</p>
            <p className="mt-1 text-xs font-medium text-gray-600">
              {comment.recommend ? "Recommended by community" : "Not recommended"}
            </p>
          </article>
        ))}
        {productComments.length === 0 && (
          <p className="text-sm text-gray-600">No comments yet. Be the first to share.</p>
        )}
      </div>
    </section>
  );
}
