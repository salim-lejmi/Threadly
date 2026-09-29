function PostCard({post,textField,dateField,likesField,onLike,onUnlike,onDelete,onRetweet,canDelete}){
    return(
        <div style={{ border: "1px solid #ccc", margin: "8px 0", padding: "8px" }}>
            <strong>@{post.createdBy.username}</strong>
            <p>{post[textField]}</p>
            <small>{new Date(post[dateField]).toLocaleString()}</small>
            <button onClick={onLike}>Like ({post[likesField] ?? 0})</button>
            <button onClick={onUnlike} Unlike></button>
            {onRetweet && <button onClick={onRetweet}>Retweet</button>}
            {canDelete && <button onClick={onDelete}>Delete</button>}

        </div>
    );
}