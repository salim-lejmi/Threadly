import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchThreadById,
  fetchLikedThreadIds,
  likeThread,
  unlikeThread,
  deleteThread,
} from "../features/threads/threadsSlice";
import {
  fetchRepliesByThread,
  fetchLikedReplyIds,
  createReply,
  deleteReply,
  likeReply,
  unlikeReply,
} from "../features/replies/replySlice";
import { fetchSimilar } from "../features/recommend/recommendSlice";
import {
  retweetThread,
  undoRetweetThread,
  fetchRetweetsByUser,
} from "../features/retweet/retweetSlice";
import PostCard from "../components/PostCard";
import Composer from "../components/Composer";
import { ArrowLeftIcon } from "../components/Icons";

function ThreadDetailPage() {
  const { threadId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentThread: thread, currentStatus, likedIds } = useSelector((state) => state.threads);
  const { items: replies, likedIds: likedReplyIds, status: replyStatus } = useSelector(
    (state) => state.replies
  );
  const { similar, similarStatus } = useSelector((state) => state.recommend);
  const { items: retweets } = useSelector((state) => state.retweet);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user.role === "role-admin";
  const retweetedIds = retweets.filter((r) => r.thread).map((r) => r.thread.threadId);

  useEffect(() => {
    dispatch(fetchThreadById(threadId));
    dispatch(fetchRepliesByThread(threadId));
    dispatch(fetchSimilar(threadId));
    dispatch(fetchLikedThreadIds());
    dispatch(fetchLikedReplyIds(threadId));
    dispatch(fetchRetweetsByUser(user.id));
  }, [dispatch, threadId, user.id]);

  if (currentStatus === "failed") {
    return <p className="empty-state">This listing doesn't exist or isn't available.</p>;
  }

  if (!thread || thread.threadId !== Number(threadId)) {
    return <p className="status-text">Loading listing...</p>;
  }

  const handleDeleteThread = async () => {
    const result = await dispatch(deleteThread(thread.threadId));
    if (deleteThread.fulfilled.match(result)) navigate("/");
  };

  return (
    <>
      <header className="page-header page-header-profile">
        <Link to="/" className="icon-button" aria-label="Back to feed">
          <ArrowLeftIcon />
        </Link>
        <h1>Listing</h1>
      </header>

      <PostCard
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
        onDelete={handleDeleteThread}
        canDelete={thread.createdBy.id === user.id || isAdmin}
      />

      <Composer
        user={user}
        placeholder="Ask a question about this listing"
        submitLabel="Reply"
        onSubmit={(text, file) =>
          dispatch(createReply({ threadId: thread.threadId, replyText: text, image: file }))
        }
      />

      {replyStatus === "loading" && <p className="status-text">Loading replies...</p>}
      {replyStatus === "succeeded" && replies.length === 0 && (
        <p className="empty-state">No replies yet. Start the conversation.</p>
      )}

      {replies.map((reply) => (
        <PostCard
          key={reply.replyId}
          post={reply}
          textField="replyText"
          dateField="replyDate"
          likesField="replyLikes"
          liked={likedReplyIds.includes(reply.replyId)}
          onLike={() => dispatch(likeReply({ threadId: thread.threadId, replyId: reply.replyId }))}
          onUnlike={() => dispatch(unlikeReply({ threadId: thread.threadId, replyId: reply.replyId }))}
          onDelete={() => dispatch(deleteReply({ threadId: thread.threadId, replyId: reply.replyId }))}
          canDelete={reply.createdBy.id === user.id || isAdmin}
        />
      ))}

      <h2 className="section-heading">Similar listings</h2>
      {similarStatus === "loading" && <p className="status-text">Finding similar listings...</p>}
      {similarStatus === "succeeded" && similar.length === 0 && (
        <p className="empty-state">No similar listings found.</p>
      )}
      {similar.map((t) => (
        <PostCard
          key={t.threadId}
          post={t}
          href={`/thread/${t.threadId}`}
          textField="threadText"
          dateField="threadDate"
          likesField="threadLikes"
          liked={likedIds.includes(t.threadId)}
          retweeted={retweetedIds.includes(t.threadId)}
          onLike={() => dispatch(likeThread(t.threadId))}
          onUnlike={() => dispatch(unlikeThread(t.threadId))}
          onRetweet={() => dispatch(retweetThread(t.threadId))}
          onUndoRetweet={() => dispatch(undoRetweetThread(t.threadId))}
          onDelete={() => dispatch(deleteThread(t.threadId))}
          canDelete={t.createdBy.id === user.id}
        />
      ))}
    </>
  );
}

export default ThreadDetailPage;