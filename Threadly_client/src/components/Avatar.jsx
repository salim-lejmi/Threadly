function Avatar({ user, large = false }) {
  const letter = user?.username ? user.username[0].toUpperCase() : "?";
  return <div className={large ? "avatar avatar-lg" : "avatar"}>{letter}</div>;
}

export default Avatar;