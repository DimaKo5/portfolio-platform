import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="notfound">
      <div className="container">
        <h1>404</h1>
        <p>Такой страницы не существует.</p>
        <Link to="/" className="btn btn-primary">
          На главную
        </Link>
      </div>
    </div>
  );
}
