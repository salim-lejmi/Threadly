import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchDashboard,
  banUser,
  unbanUser,
  adminDeleteThread,
  adminDeleteReply,
} from "../features/admin/adminSlice";
import Avatar from "../components/Avatar";

function AdminPage() {
  const [tab, setTab] = useState("users");
  const dispatch = useDispatch();
  const { stats, users, threads, replies, status, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // run an admin action, then reload the dashboard so everything is up to date
  const run = async (action, question) => {
    if (!window.confirm(question)) return;
    await dispatch(action);
    dispatch(fetchDashboard());
  };

  const formatDate = (d) => new Date(d).toLocaleString();

  return (
    <>
      <header className="page-header">
        <h1>Admin dashboard</h1>
      </header>

      {error && <p className="error-text">{error}</p>}
      {!stats && status !== "failed" && <p className="status-text">Loading dashboard...</p>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card"><strong>{stats.users}</strong><span>Users</span></div>
          <div className="stat-card"><strong>{stats.banned}</strong><span>Banned</span></div>
          <div className="stat-card"><strong>{stats.threads}</strong><span>Threads</span></div>
          <div className="stat-card"><strong>{stats.replies}</strong><span>Replies</span></div>
        </div>
      )}

      <div className="tab-bar">
        <button className={tab === "users" ? "tab active" : "tab"} onClick={() => setTab("users")}>
          Users
        </button>
        <button className={tab === "threads" ? "tab active" : "tab"} onClick={() => setTab("threads")}>
          Threads
        </button>
        <button className={tab === "replies" ? "tab active" : "tab"} onClick={() => setTab("replies")}>
          Replies
        </button>
      </div>

      {tab === "users" &&
        users.map((u) => (
          <div key={u.id} className="admin-row">
            <Avatar user={u} />
            <div className="admin-row-main">
              <Link to={`/profile/${u.id}`}><strong>{u.username}</strong></Link>{" "}
              {u.role === "role-admin" && <span className="badge badge-admin">admin</span>}
              {u.banned && <span className="badge badge-banned">banned</span>}
              <div className="admin-row-sub">Joined {formatDate(u.createdAt)}</div>
            </div>
            {u.role !== "role-admin" &&
              (u.banned ? (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => run(unbanUser(u.id), `Unban @${u.username}?`)}
                >
                  Unban
                </button>
              ) : (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => run(banUser(u.id), `Ban @${u.username}?`)}
                >
                  Ban
                </button>
              ))}
          </div>
        ))}

      {tab === "threads" && (
        <>
          {threads.length === 0 && <p className="empty-state">No threads.</p>}
          {threads.map((t) => (
            <div key={t.threadId} className="admin-row">
              <div className="admin-row-main">
                <strong>@{t.createdBy.username}</strong>
                {t.createdBy.banned && <span className="badge badge-banned">banned</span>}
                <p>{t.threadText}</p>
                <div className="admin-row-sub">{formatDate(t.threadDate)}</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => run(adminDeleteThread(t.threadId), "Delete this thread and its replies?")}
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}

      {tab === "replies" && (
        <>
          {replies.length === 0 && <p className="empty-state">No replies.</p>}
          {replies.map((r) => (
            <div key={r.replyId} className="admin-row">
              <div className="admin-row-main">
                <strong>@{r.createdBy.username}</strong>
                {r.createdBy.banned && <span className="badge badge-banned">banned</span>}
                <p>{r.replyText}</p>
                <div className="admin-row-sub">{formatDate(r.replyDate)}</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => run(adminDeleteReply(r.replyId), "Delete this reply?")}
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default AdminPage;