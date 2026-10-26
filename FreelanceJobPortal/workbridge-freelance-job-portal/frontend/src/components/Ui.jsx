import { Link } from 'react-router-dom';
import { date, money } from '../api';

export function Loading({ text = 'Loading…' }) { return <div className="py-5 text-center"><div className="spinner-border text-primary" role="status" /><p className="text-secondary mt-3 mb-0">{text}</p></div>; }
export function ErrorMessage({ error }) { return error ? <div className="alert alert-danger" role="alert">{error}</div> : null; }
export function EmptyState({ title, text, action }) { return <div className="empty-state text-center"><div className="empty-icon">⌁</div><h3>{title}</h3><p className="text-secondary mb-3">{text}</p>{action}</div>; }
export function Badge({ children, variant = 'primary' }) { return <span className={`badge rounded-pill text-bg-${variant}`}>{children}</span>; }

export function JobCard({ job, onApply, compact = false }) {
  return <article className="job-card h-100">
    <div className="d-flex justify-content-between gap-2 align-items-start mb-3"><div><span className="eyebrow">{job.category_name}</span><h3 className="h5 mb-0 mt-1"><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3></div><Badge variant={job.experience_level === 'expert' ? 'dark' : 'primary'}>{job.experience_level}</Badge></div>
    {!compact && <p className="text-secondary line-clamp-2">{job.description}</p>}
    <div className="d-flex flex-wrap gap-2 mb-3">{(job.skills || '').split(',').slice(0, 4).map((skill) => <span className="skill-chip" key={skill}>{skill.trim()}</span>)}</div>
    <div className="job-meta"><span>By {job.client_name}</span><span>Due {date(job.deadline)}</span></div>
    <div className="d-flex justify-content-between align-items-end pt-3 mt-auto border-top"><div><small className="text-secondary d-block">Project budget</small><strong>{money(job.budget_min)}–{money(job.budget_max)}</strong></div>{onApply ? <button className="btn btn-primary btn-sm" onClick={() => onApply(job)}>Apply</button> : <Link className="btn btn-outline-primary btn-sm" to={`/jobs/${job.id}`}>View job</Link>}</div>
  </article>;
}

export function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop-custom" role="dialog" aria-modal="true"><div className={`modal-dialog-custom ${wide ? 'modal-wide' : ''}`}><div className="d-flex justify-content-between gap-3 align-items-center p-4 border-bottom"><h2 className="h4 mb-0">{title}</h2><button aria-label="Close" className="btn-close" onClick={onClose} /></div><div className="p-4">{children}</div></div></div>;
}

