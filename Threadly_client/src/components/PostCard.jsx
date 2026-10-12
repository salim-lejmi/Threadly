import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { HeartIcon, RepostIcon, TrashIcon } from "./Icons";

function PostCard({
  post,
  textField,
  dateField,
  likesField,
  liked,
  retweeted,
  retweetedBy,
  onLike,
  onUnlike,
  onRetweet,
  onUndoRetweet,
  onDelete,
  canDelete,
}) {
  const date = new Date(post[dateField]);

  return (
    <article className="post-card">
      <Link to={`/profile/${post.createdBy.id}`}>
        <Avatar user={post.createdBy} />
      </Link>

      <div className="post-body">
        {retweetedBy && (
          <div className="post-repost-label">
            <RepostIcon />
            <span>{retweetedBy.username} retweeted</span>
          </div>
        )}

        <div className="post-header">
          <Link to={`/profile/${post.createdBy.id}`} className="post-author">
            {post.createdBy.username}
          </Link>
          <span className="post-meta">@{post.createdBy.username}</span>
          <span className="post-meta">·</span>
          <span className="post-meta" title={date.toLocaleString()}>
            {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>

        <p className="post-text">{post[textField]}</p>

        <div className="post-actions">
          <button
            className={liked ? "action action-like active" : "action action-like"}
            onClick={liked ? onUnlike : onLike}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <HeartIcon />
            <span>{post[likesField] ?? 0}</span>
          </button>

          {onRetweet && (
            <button
              className={retweeted ? "action action-repost active" : "action action-repost"}
              onClick={retweeted ? onUndoRetweet : onRetweet}
              aria-label={retweeted ? "Undo retweet" : "Retweet"}
            >
              <RepostIcon />
            </button>
          )}

          {canDelete && (
            <button
              className="action action-delete"
              onClick={onDelete}
              aria-label="Delete"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default PostCard;