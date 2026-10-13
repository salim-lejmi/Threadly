import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
  fetchUserById,
  updateAvatar,
  removeAvatar,
  updateBio,
} from "../features/users/userSlice";
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
import { ACCEPT, validateImage } from "../utils/image";

function ProfileContent() {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const { profileUser, status: userStatus } = useSelector((state) => state.users);
  const { items: threads, likedIds, status: threadStatus } = useSelector((state) => state.threads);
  const { items: myRetweets, profileItems: profileRetweets } = useSelector((state) => state.retweet);
  const { following, followers } = useSelector((state) => state.follow);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [dragging, setDragging] = useState(false);
  const [editError, setEditError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInput = useRef(null);

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

  if (userStatus === "failed") {
    return <p className="empty-state">This account doesn't exist or isn't available.</p>;
  }

  if (userStatus === "loading" || !profileUser) {
    return <p className="status-text">Loading profile...</p>;
  }

  const isOwnProfile = currentUser.id === profileUser.id;
  const isFollowing = followers.some((f) => f.follower.id === currentUser.id);

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

  // ----- edit profile -----
  const openEditor = () => {
    setBio(profileUser.bio || "");
    setEditError("");
    setSaved(false);
    setEditing(!editing);
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setEditError(problem);
      return;
    }
    setEditError("");
    const result = await dispatch(updateAvatar(file));
    if (updateAvatar.rejected.match(result)) setEditError(result.payload);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadPhoto(e.dataTransfer.files[0]);
  };

  const handleRemovePhoto = async () => {
    setEditError("");
    const result = await dispatch(removeAvatar());
    if (removeAvatar.rejected.match(result)) setEditError(result.payload);
  };

  const handleSaveBio = async () => {
    setEditError("");
    setSaved(false);
    const result = await dispatch(updateBio(bio));
    if (updateBio.rejected.match(result)) setEditError(result.payload);
    else setSaved(true);
  };

  return (
    <>
      <header className="page-header page-header-profile">
        <Link to="/" className="icon-button" aria-label="Back to feed">
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1>{profileUser.username}</h1>
          <span className="page-subtitle">{threads.length} listings</span>
        </div>
      </header>

      <div className="profile-banner" />

      <section className="profile-info">
        <div className="profile-top">
          <Avatar user={profileUser} large />
          {isOwnProfile ? (
            <button className="btn btn-neutral" onClick={openEditor}>
              {editing ? "Close" : "Edit profile"}
            </button>
          ) : isFollowing ? (
            <button className="btn btn-outline" onClick={handleUnfollow}>
              Unfollow
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleFollow}>
              Follow
            </button>
          )}
        </div>

        <h2 className="profile-name">{profileUser.username}</h2>
        <p className="profile-handle">@{profileUser.username}</p>
        {profileUser.banned && <span className="badge badge-banned">banned</span>}
        {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}

        <p className="profile-stats">
          <span><strong>{following.length}</strong> following</span>
          <span><strong>{followers.length}</strong> followers</span>
        </p>
      </section>

      {isOwnProfile && editing && (
        <section className="edit-panel">
          <div
            className={dragging ? "dropzone dragging" : "dropzone"}
            onClick={() => fileInput.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <Avatar user={profileUser} />
            <span>Drop a photo here, or click to choose one</span>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => {
              uploadPhoto(e.target.files[0]);
              e.target.value = "";
            }}
          />

          {profileUser.profilePicture && (
            <button className="btn btn-outline btn-sm edit-remove" onClick={handleRemovePhoto}>
              Remove photo
            </button>
          )}

          <label htmlFor="bio" className="edit-label">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Tell people about yourself"
          />

          {editError && <p className="composer-error">{editError}</p>}
          {saved && <p className="edit-saved">Saved</p>}

          <div className="edit-actions">
            <button className="btn btn-primary" onClick={handleSaveBio}>
              Save bio
            </button>
          </div>
        </section>
      )}

      <div className="tab-bar">
        <span className="tab active">Listings</span>
      </div>

      {threadStatus === "succeeded" && timeline.length === 0 && (
        <p className="empty-state">No listings yet.</p>
      )}

      {timeline.map((entry) => (
        <PostCard
          key={entry.key}
          post={entry.thread}
          href={`/thread/${entry.thread.threadId}`}
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

function ProfilePage() {
  const { userId } = useParams();
  return <ProfileContent key={userId} />;
}

export default ProfilePage;