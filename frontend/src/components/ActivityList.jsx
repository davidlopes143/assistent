import styles from './ActivityList.module.css';

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function ActivityList({ activities, onToggle, onEdit, onDelete, today }) {
  if (activities.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📝</span>
        <p>Nenhuma atividade encontrada</p>
        <span>Clique em "Nova atividade" para começar</span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {activities.map(activity => {
        const isOverdue = activity.status === 'pending' && activity.due_date < today;
        const isDone = activity.status === 'done';

        return (
          <div
            key={activity.id}
            className={`${styles.card} ${isDone ? styles.done : ''} ${isOverdue ? styles.overdue : ''}`}
          >
            <button
              className={`${styles.checkbox} ${isDone ? styles.checked : ''}`}
              onClick={() => onToggle(activity)}
              title={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
            >
              {isDone && <span>✓</span>}
            </button>

            <div className={styles.content}>
              <p className={styles.title}>{activity.title}</p>
              {activity.description && (
                <p className={styles.description}>{activity.description}</p>
              )}
              <div className={styles.meta}>
                <span className={`${styles.badge} ${isOverdue ? styles.badgeOverdue : isDone ? styles.badgeDone : styles.badgePending}`}>
                  {isDone ? 'Concluída' : isOverdue ? 'Atrasada' : 'Pendente'}
                </span>
                <span className={styles.date}>
                  {isOverdue ? '⚠ ' : '📅 '} Vencimento: {formatDate(activity.due_date)}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => onEdit(activity)} title="Editar">
                ✏️
              </button>
              <button className={styles.deleteBtn} onClick={() => onDelete(activity.id)} title="Excluir">
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
