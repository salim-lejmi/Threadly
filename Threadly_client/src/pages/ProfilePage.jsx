import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchUserById } from "../features/users/userSlice";
import {
  fetchThreadsByUser,
  fetchLikedThreadIds,
  likeThread,
  unlikeThread,
  deleteThread,
} from "../features/threads/threadsSlice";
import {
  retweetThread,
  undoRetweetThread,
  fetchRetweetsByUser,
  fetchProfileRetweets,
  clearProfileRetweets,
} from "../features/retweet/retweetSlice";
import {
  followUser,
  unfollowUser,
  fetchFollowing,
  fetchFollowers,
} from "../features/follow/followSlice";
import PostCard from "../components/PostCard";
import Avatar from "../components/Avatar";
import { ArrowLeftIcon } from "../components/Icons";

function ProfilePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const { profileUser, status: userStatus } = useSelector((state) => state.users);
  const { items: threads, likedIds, status: threadStatus } = useSelector((state) => state.threads);
  const { items: myRetweets, profileItems: profileRetweets } = useSelector((state) => state.retweet);
  const { following, followers } = useSelector((state) => state.follow);
  const { user: currentUser } = useSelector((state) => state.auth);

  const retweetedIds = myRetweets.filter((r) => r.thread).map((r) => r.thread.threadId);

  useEffect(() => {
    dispatch(clearProfileRetweets());
    dispatch(fetchUserById(userId));
    dispatch(fetchThreadsByUser(userId));
    dispatch(fetchProfileRetweets(userId));
    dispatch(fetchFollowers(userId));
    dispatch(fetchFollowing(userId));
    dispatch(fetchLikedThreadIds());
    dispatch(fetchRetweetsByUser(currentUser.id));
  }, [dispatch, userId, currentUser.id]);

  if (userStatus === "loading" || !profileUser) {
    return <p className="status-text">Loading profile...</p>;
  }

  const isOwnProfile = currentUser.id === profileUser.id;
  const isFollowing = followers.some((f) => f.follower.id === currentUser.id);

  // own threads + retweets, newest first
  const timeline = [
    ...threads.map((t) => ({
      key: `post-${t.threadId}`,
      thread: t,
      date: new Date(t.threadDate),
      retweetedBy: null,
    })),
    ...profileRetweets
      .filter((r) => r.thread)
      .map((r) => ({
        key: `rt-${r.retweetId}`,
        thread: r.thread,
        date: new Date(r.retweetDate),
        retweetedBy: r.retweetedBy,
      })),
  ].sort((a, b) => b.date - a.date);

  const handleFollow = async () => {
    await dispatch(followUser(profileUser.id));
    dispatch(fetchFollowers(profileUser.id));
    dispatch(fetchFollowing(profileUser.id));
  };

  const handleUnfollow = async () => {
    await dispatch(unfollowUser(profileUser.id));
    dispatch(fetchFollowers(profileUser.id));
    dispatch(fetchFollowing(profileUser.id));
  };

  const handleRetweet = async (threadId) => {
    await dispatch(retweetThread(threadId));
    dispatch(fetchProfileRetweets(userId));
  };

  const handleUndoRetweet = async (threadId) => {
    await dispatch(undoRetweetThread(threadId));
    dispatch(fetchProfileRetweets(userId));
  };

  return (
    <>
      <header className="page-header page-header-profile">
        <Link to="/" className="icon-button" aria-label="Back to feed">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1>{profileUser.username}</h1>
          <span className="page-subtitle">{threads.length} threads</span>
        </div>
      </header>

      <div className="profile-banner" />

      <section className="profile-info">
        <div className="profile-top">
          <Avatar user={profileUser} large />
          {!isOwnProfile &&
            (isFollowing ? (
              <button className="btn btn-outline" onClick={handleUnfollow}>
                Unfollow
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleFollow}>
                Follow
              </button>
            ))}
        </div>

        <h2 className="profile-name">{profileUser.username}</h2>
        <p className="profile-handle">@{profileUser.username}</p>
        {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}

        <p className="profile-stats">
          <span><strong>{following.length}</strong> following</span>
          <span><strong>{followers.length}</strong> followers</span>
        </p>
      </section>

      <div className="tab-bar">
        <span className="tab active">Threads</span>
      </div>

      {threadStatus === "succeeded" && timeline.length === 0 && (
        <p className="empty-state">No threads yet.</p>
      )}

      {timeline.map((entry) => (
        <PostCard
          key={entry.key}
          post={entry.thread}
          retweetedBy={entry.retweetedBy}
          textField="threadText"
          dateField="threadDate"
          likesField="threadLikes"
          liked={likedIds.includes(entry.thread.threadId)}
          retweeted={retweetedIds.includes(entry.thread.threadId)}
          onLike={() => dispatch(likeThread(entry.thread.threadId))}
          onUnlike={() => dispatch(unlikeThread(entry.thread.threadId))}
          onRetweet={() => handleRetweet(entry.thread.threadId)}
          onUndoRetweet={() => handleUndoRetweet(entry.thread.threadId)}
          onDelete={() => dispatch(deleteThread(entry.thread.threadId))}
          canDelete={entry.thread.createdBy.id === currentUser.id && !entry.retweetedBy}
        />
      ))}
    </>
  );
}

export default ProfilePage;