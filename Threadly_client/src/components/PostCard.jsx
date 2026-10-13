import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { HeartIcon, RepostIcon, TrashIcon, CommentIcon } from "./Icons";
import { fileUrl } from "../api/url";
import { CURRENCY } from "../utils/categories";

function PostCard({
  post,
  textField,
  dateField,
  likesField,
  liked,
  retweeted,
  retweetedBy,
  href,
  onLike,
  onUnlike,
  onRetweet,
  onUndoRetweet,
  onDelete,
  canDelete,
}) {
  const [view, setView] = useState("showcase");
  const date = new Date(post[dateField]);
  const text = post[textField];

  const isListing = Boolean(post.title);
  const showDetails = isListing && view === "details";

  return (
    <article className="post-card">
      <Link to={`/profile/${post.createdBy.id}`}>
        <Avatar user={post.createdBy} />
      </Link>

      <div className="post-body">
        {retweetedBy && (
          <div className="post-repost-label">
            <RepostIcon />
            <span>{retweetedBy.username} recommended</span>
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

        {isListing && (
          <div className="listing-head">
            <div>
              <h3 className="listing-title">{post.title}</h3>
              {post.category && <span className="badge badge-category">{post.category}</span>}
            </div>
            <button
              type="button"
              className="view-toggle"
              onClick={() => setView(showDetails ? "showcase" : "details")}
            >
              {showDetails ? "Showcase" : "Details"}
            </button>
          </div>
        )}

        {showDetails && (
          <dl className="listing-details">
            <div><dt>Price</dt><dd>{post.price != null ? `${post.price.toLocaleString()} ${CURRENCY}` : "Contact for price"}</dd></div>
            <div><dt>City</dt><dd>{post.city || "Not specified"}</dd></div>
            <div><dt>Category</dt><dd>{post.category}</dd></div>
            <div><dt>Posted</dt><dd>{date.toLocaleDateString()}</dd></div>
          </dl>
        )}

        {text &&
          (href ? (
            <Link to={href} className="post-text-link">
              <p className="post-text">{text}</p>
            </Link>
          ) : (
            <p className="post-text">{text}</p>
          ))}

        {post.imageUrl && !showDetails && (
          <a
            href={fileUrl(post.imageUrl)}
            target="_blank"
            rel="noreferrer"
            className="post-image-link"
          >
            <img className="post-image" src={fileUrl(post.imageUrl)} alt="Attachment" />
          </a>
        )}

        <div className="post-actions">
          {href && (
            <Link to={href} className="action action-comment" aria-label="Open listing" title="Open">
              <CommentIcon />
            </Link>
          )}

          <button
            className={liked ? "action action-like active" : "action action-like"}
            onClick={liked ? onUnlike : onLike}
            aria-label={liked ? "Remove from saved" : "Save"}
            title={liked ? "Remove from saved" : "Save"}
          >
            <HeartIcon />
            <span>{post[likesField] ?? 0}</span>
          </button>

          {onRetweet && (
            <button
              className={retweeted ? "action action-repost active" : "action action-repost"}
              onClick={retweeted ? onUndoRetweet : onRetweet}
              aria-label={retweeted ? "Remove recommendation" : "Recommend"}
              title={retweeted ? "Remove recommendation" : "Recommend"}
            >
              <RepostIcon />
            </button>
          )}

          {canDelete && (
            <button
              className="action action-delete"
              onClick={onDelete}
              aria-label="Delete"
              title="Delete"
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