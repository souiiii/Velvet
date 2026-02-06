import { Copy, ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

function Link({ link, fileName }) {
  const [timeAgo, setTimeAgo] = useState(
    () =>
      DateTime.fromISO(link.createdAt, {
        zone: "utc",
      }).toRelative() || "Some time ago",
  );

  const title = fileName
    ? fileName.trim().slice(0, 1).toUpperCase() + fileName.trim().slice(1)
    : "File.fileType";

  useEffect(
    function () {
      setTimeout(() => {
        const getAgo =
          DateTime.fromISO(link.createdAt, {
            zone: "utc",
          }).toRelative() || "Some time ago";
        setTimeAgo(getAgo);
      }, 60000);
    },
    [link.createdAt, timeAgo],
  );

  return (
    <div className="box link-box">
      <div className="link-top-heading-div">
        <div className="link-top-heading-inner-div">
          <div className="link-top-heading">{title}</div>
          <div className="link-ago-time-created">{timeAgo}</div>
        </div>
      </div>
      <div className="link-display-action-div">
        <div className="link-display">{link.publicId}</div>
        <div className="link-action-inner-div">
          <div className="link-action-copy">
            <Copy />
          </div>
          <div className="link-action-redirect">
            <ExternalLink />
          </div>
        </div>
      </div>
      <div className="link-display-action-downloads"></div>
    </div>
  );
}

export default Link;
