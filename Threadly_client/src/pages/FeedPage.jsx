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
import Avatar from "../components/Avatar";

function FeedPage() {
  const [threadText, setThreadText] = useState("");
  const [tab, setTab] = useState("following");
  const dispatch = useDispatch();

  const { items: threads, likedIds, status, error } = useSelector((state) => state.threads);
  const { items: retweets } = useSelector((state) => state.retweet);
  const { user } = useSelector((state) => state.auth);

  const retweetedIds = retweets.filter((r) => r.thread).map((r) => r.thread.threadId);

  useEffect(() => {
    dispatch(tab === "following" ? fetchFeed() : fetchAllThreads());
  }, [dispatch, tab]);

  useEffect(() => {
    dispatch(fetchLikedThreadIds());
    dispatch(fetchRetweetsByUser(user.id));
  }, [dispatch, user.id]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!threadText.trim()) return;
    dispatch(createThread(threadText));
    setThreadText("");
  };

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

      <form className="composer" onSubmit={handleCreate}>
        <Avatar user={user} />
        <div className="composer-body">
          <textarea
            value={threadText}
            onChange={(e) => setThreadText(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
            rows={2}
          />
          <div className="composer-footer">
            <span className={threadText.length > 260 ? "char-count warn" : "char-count"}>
              {threadText.length}/280
            </span>
            <button className="btn btn-primary" type="submit" disabled={!threadText.trim()}>
              Post
            </button>
          </div>
        </div>
      </form>

      {status === "loading" && <p className="status-text">Loading threads...</p>}
      {error && <p className="error-text">{error}</p>}

      {status === "succeeded" && threads.length === 0 && (
        <p className="empty-state">
          {tab === "following" ? (
            <>
              Nothing here yet. Follow people to fill your feed. Try{" "}
              <Link to="/search">Search</Link>.
            </>
          ) : (
            "No threads yet. Be the first to post."
          )}
        </p>
      )}

      {threads.map((thread) => (
        <PostCard
          key={thread.threadId}
          post={thread}
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