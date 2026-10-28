export function Card({ children, className = '', hover = false, onClick, id }) {
  return (
    <div id={id} onClick={onClick} className={`card-base ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}
