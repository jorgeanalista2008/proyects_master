import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  image?: string;
  title: string;
  category?: string;
  price: number;
  badgeText?: string;
  actionLabel: string;
  onAction?: () => void;
}

export default function Card({
  image,
  title,
  category,
  price,
  badgeText,
  actionLabel,
  onAction,
}: CardProps) {
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(price);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {image ? (
          <img src={image} alt={title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>Sin Imagen</span>
          </div>
        )}
      </div>
      <div className={styles.infoContainer}>
        {category && <span className={styles.category}>{category}</span>}
        <h3 className={styles.title}>{title}</h3>
        {badgeText && (
          <div className={styles.badgeRow}>
            <span className={styles.badge}>{badgeText}</span>
          </div>
        )}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formattedPrice}</span>
        </div>
        <button className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
