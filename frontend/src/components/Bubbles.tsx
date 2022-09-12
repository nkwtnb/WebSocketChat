import { Message } from "../App";
// import "./Bubbles.modules.css";

export const Bubbles = ({sender, content, time}: Message) => {
  const classNames = [
    (sender === "me" ? "bg-lime-200 ml-auto sender-me" : "bg-blue-200 mr-auto sender-other"),
    "inline-block",
    "relative",
    "w-4/12",
    "rounded-xl",
    "mb-2",
    "px-2",
    "py-2",
    "text-left",
    "break-all",
    "whitespace-pre-wrap",
  ]
  return (
    <li>
      <div className={sender === "me" ? "text-right" : "text-left"}>
        {
          sender === "me" ? <span className="text-sm mr-1">{time}</span> : null
        }
        <div className={classNames.join(" ")}>
          <span>{content}</span>
        </div>
        {
          sender === "other" ? <span className="text-sm ml-1">{time}</span> : null
        }
      </div>
    </li>
  );
}
