import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="container py-5 text-center"><p className="kicker">404</p><h1>That page wandered off.</h1><p className="text-secondary">Let’s get you back to work.</p><Link className="btn btn-primary" to="/">Go home</Link></div>; }

