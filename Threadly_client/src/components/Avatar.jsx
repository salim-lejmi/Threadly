import { fileUrl } from "../api/url";

function Avatar({ user, large = false }) {
  const cls = large ? "avatar avatar-lg" : "avatar";

  if (user?.profilePicture) {
    return <img className={cls} src={fileUrl(user.profilePicture)} alt={user.username} />;
  }

  const letter = user?.username ? user.username[0].toUpperCase() : "?";
  return <div className={cls}>{letter}</div>;
}

export default Avatar;