import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { searchUsers, searchThreads, clearSearch } from "../features/search/searchSlice";
import {
  fetchLikedThreadIds,
  likeThread,
  unlikeThread,
  deleteThread,
} from "../features/threads/threadsSlice";
import {
  retweetThread,
  undoRetweetThread,
  fetchRetweetsByUser,
} from "../features/retweet/retweetSlice";
import PostCard from "../components/PostCard";
import Avatar from "../components/Avatar";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [tab, setTab] = useState("people");
  const dispatch = useDispatch();

  const { users, threads, status, error } = useSelector((state) => state.search);
  const { likedIds } = useSelector((state) => state.threads);
  const { items: retweets } = useSelector((state) => state.retweet);
  const { user } = useSelector((state) => state.auth);

  const retweetedIds = retweets.filter((r) => r.thread).map((r) => r.thread.threadId);

  useEffect(() => {
    dispatch(clearSearch());
    dispatch(fetchLikedThreadIds());
    dispatch(fetchRetweetsByUser(user.id));
  }, [dispatch, user.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().replace(/^@/, "");
    if (!q) return;
    setSubmitted(q);
    dispatch(searchUsers(q));
    dispatch(searchThreads(q));
  };

  return (
    <>
      <header className="page-header">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or threads"
            autoFocus
          />
        </form>
      </header>

      <div className="tab-bar">
        <button
          className={tab === "people" ? "tab active" : "tab"}
          onClick={() => setTab("people")}
        >
          People
        </button>
        <button
          className={tab === "threads" ? "tab active" : "tab"}
          onClick={() => setTab("threads")}
        >
          Threads
        </button>
      </div>

      {!submitted && (
        <p className="empty-state">Search for people to follow or threads to read.</p>
      )}

      {error && <p className="error-text">{error}</p>}
      {submitted && status === "loading" && <p className="status-text">Searching...</p>}

      {submitted && status === "succeeded" && tab === "people" && (
        <>
          {users.length === 0 && (
            <p className="empty-state">No people found for "{submitted}".</p>
          )}
          {users.map((u) => (
            <Link key={u.id} to={`/profile/${u.id}`} className="user-row">
              <Avatar user={u} />
              <div className="user-row-text">
                <strong>{u.username}</strong>
                <span>@{u.username}</span>
              </div>
            </Link>
          ))}
        </>
      )}

      {submitted && status === "succeeded" && tab === "threads" && (
        <>
          {threads.length === 0 && (
            <p className="empty-state">No threads found for "{submitted}".</p>
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
      )}
    </>
  );
}

export default SearchPage;