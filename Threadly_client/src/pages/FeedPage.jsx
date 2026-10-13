import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchAllThreads,
  fetchFeed,
  fetchLikedThreadIds,
  createThread,
  deleteThread,
  likeThread,
  unlikeThread,
} from "../features/threads/threadsSlice";
import {
  retweetThread,
  undoRetweetThread,
  fetchRetweetsByUser,
} from "../features/retweet/retweetSlice";
import PostCard from "../components/PostCard";
import Composer from "../components/Composer";
import { CATEGORIES } from "../utils/categories";

function FeedPage() {
  const [tab, setTab] = useState("following");
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();

  const { items: threads, likedIds, status, error } = useSelector((state) => state.threads);
  const { items: retweets } = useSelector((state) => state.retweet);
  const { user } = useSelector((state) => state.auth);

  const retweetedIds = retweets.filter((r) => r.thread).map((r) => r.thread.threadId);

  useEffect(() => {
    dispatch(tab === "following" ? fetchFeed() : fetchAllThreads(category));
  }, [dispatch, tab, category]);

  useEffect(() => {
    dispatch(fetchLikedThreadIds());
    dispatch(fetchRetweetsByUser(user.id));
  }, [dispatch, user.id]);

  return (
    <>
      <header className="page-header">
        <h1>Home</h1>
      </header>

      <div className="tab-bar">
        <button
          className={tab === "following" ? "tab active" : "tab"}
          onClick={() => setTab("following")}
        >
          Following
        </button>
        <button
          className={tab === "explore" ? "tab active" : "tab"}
          onClick={() => setTab("explore")}
        >
          Explore
        </button>
      </div>

      <Composer
        listing
        user={user}
        placeholder="Describe your service"
        submitLabel="Publish listing"
        onSubmit={(text, file, extra) =>
          dispatch(createThread({ threadText: text, image: file, ...extra }))
        }
      />

      {tab === "explore" && (
        <div className="filter-bar">
          <select
            className="field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {status === "loading" && <p className="status-text">Loading listings...</p>}
      {error && <p className="error-text">{error}</p>}

      {status === "succeeded" && threads.length === 0 && (
        <p className="empty-state">
          {tab === "following" ? (
            <>
              Nothing here yet. Follow providers to fill your feed. Try{" "}
              <Link to="/search">Search</Link>.
            </>
          ) : (
            "No listings found."
          )}
        </p>
      )}

      {threads.map((thread) => (
        <PostCard
          key={thread.threadId}
          post={thread}
          href={`/thread/${thread.threadId}`}
          textField="threadText"
          dateField="threadDate"
          likesField="threadLikes"
          liked={likedIds.includes(thread.threadId)}
          retweeted={retweetedIds.includes(thread.threadId)}
          onLike={() => dispatch(likeThread(thread.threadId))}
          onUnlike={() => dispatch(unlikeThread(thread.threadId))}
          onRetweet={() => dispatch(retweetThread(thread.threadId))}
          onUndoRetweet={() => dispatch(undoRetweetThread(thread.threadId))}
          onDelete={() => dispatch(deleteThread(thread.threadId))}
          canDelete={thread.createdBy.id === user.id}
        />
      ))}
    </>
  );
}

export default FeedPage;