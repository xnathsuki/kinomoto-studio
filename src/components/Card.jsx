import { CardDecor } from './KawaiiDecor';
import './Card.css';

export default function Card({ children, className = '', hoverable = true }) {
  return (
    <div className={`kawaii-card ${hoverable ? 'hoverable' : ''} ${className}`}>
      <CardDecor />
      {children}
    </div>
  );
}
