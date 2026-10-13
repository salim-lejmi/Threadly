import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "./Avatar";
import { ImageIcon, CloseIcon } from "./Icons";
import { ACCEPT, validateImage } from "../utils/image";
import { CATEGORIES, CURRENCY } from "../utils/categories";

const MAX_LENGTH = 255;

function Composer({ user, placeholder, submitLabel, onSubmit, listing = false }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const canSubmit = listing
    ? title.trim() && category
    : text.trim() || file;

  const pickFile = (f) => {
    if (!f) return;
    const problem = validateImage(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.files[0];
    if (pasted && pasted.type.startsWith("image/")) {
      e.preventDefault();
      pickFile(pasted);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy || !canSubmit) return;

    setBusy(true);
    const result = await onSubmit(text.trim(), file, {
      title: title.trim(),
      category,
      price,
      city: city.trim(),
    });
    setBusy(false);

    if (result?.meta?.requestStatus === "fulfilled") {
      setText("");
      setFile(null);
      setTitle("");
      setCategory("");
      setPrice("");
      setCity("");
      setError("");
    } else {
      setError(typeof result?.payload === "string" ? result.payload : "Something went wrong");
    }
  };

  return (
    <form
      className={dragging ? "composer dragging" : "composer"}
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Avatar user={user} />
      <div className="composer-body">
        {listing && (
          <div className="listing-fields">
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Service title (e.g. Logo design)"
              maxLength={80}
            />
            <div className="listing-row">
              <select
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                className="field"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={`Price (${CURRENCY})`}
              />
              <input
                className="field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                maxLength={60}
              />
            </div>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          maxLength={MAX_LENGTH}
          rows={2}
        />

        {preview && (
          <div className="composer-preview">
            <img src={preview} alt="Selected" />
            <button
              type="button"
              className="preview-remove"
              onClick={() => setFile(null)}
              aria-label="Remove image"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {error && <p className="composer-error">{error}</p>}

        <div className="composer-footer">
          <div className="composer-tools">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                pickFile(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="icon-button image-button"
              onClick={() => inputRef.current.click()}
              aria-label="Add image"
              title="Add image (or drag and drop)"
            >
              <ImageIcon />
            </button>
          </div>

          <div className="composer-submit">
            <span className={text.length > MAX_LENGTH - 20 ? "char-count warn" : "char-count"}>
              {text.length}/{MAX_LENGTH}
            </span>
            <button className="btn btn-primary" type="submit" disabled={busy || !canSubmit}>
              {busy ? "Sending..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Composer;