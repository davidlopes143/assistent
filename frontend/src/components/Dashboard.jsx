import { useState, useEffect, useCallback } from 'react';
import ActivityForm from './ActivityForm';
import ActivityList from './ActivityList';
import styles from './Dashboard.module.css';

const API = '/api';

function getToken() {
  return localStorage.getItem('planner_token');
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

export default function Dashboard({ user, onLogout }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | done | overdue

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`${API}/activities`, { headers: authHeaders() });
      if (res.ok) setActivities(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  async function handleSave(data) {
    if (editingActivity) {
      const res = await fetch(`${API}/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setActivities(acts => acts.map(a => a.id === updated.id ? updated : a));
      }
    } else {
      const res = await fetch(`${API}/activities`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setActivities(acts => [...acts, created]);
      }
    }
    setShowForm(false);
    setEditingActivity(null);
  }

  async function handleToggle(activity) {
    const newStatus = activity.status === 'done' ? 'pending' : 'done';
    const res = await fetch(`${API}/activities/${activity.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setActivities(acts => acts.map(a => a.id === updated.id ? updated : a));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta atividade?')) return;
    const res = await fetch(`${API}/activities/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) setActivities(acts => acts.filter(a => a.id !== id));
  }

  function handleEdit(activity) {
    setEditingActivity(activity);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingActivity(null);
  }

  const today = new Date().toISOString().split('T')[0];

  const filtered = activities.filter(a => {
    if (filter === 'pending') return a.status === 'pending' && a.due_date >= today;
    if (filter === 'done') return a.status === 'done';
    if (filter === 'overdue') return a.status === 'pending' && a.due_date < today;
    return true;
  });

  const counts = {
    all: activities.length,
    pending: activities.filter(a => a.status === 'pending' && a.due_date >= today).length,
    overdue: activities.filter(a => a.status === 'pending' && a.due_date < today).length,
    done: activities.filter(a => a.status === 'done').length,
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <span className={styles.logoIcon}>📋</span>
            <div>
              <h1 className={styles.appName}>Planner de Atividades</h1>
              <p className={styles.userName}>Olá, {user.name}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.newBtn} onClick={() => setShowForm(true)}>
              + Nova atividade
            </button>
            <button className={styles.logoutBtn} onClick={onLogout}>Sair</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.stats}>
          {[
            { key: 'all', label: 'Total', color: '#667eea' },
            { key: 'pending', label: 'Pendentes', color: '#ed8936' },
            { key: 'overdue', label: 'Atrasadas', color: '#e53e3e' },
            { key: 'done', label: 'Concluídas', color: '#38a169' },
          ].map(s => (
            <button
              key={s.key}
              className={`${styles.statCard} ${filter === s.key ? styles.statActive : ''}`}
              onClick={() => setFilter(s.key)}
              style={{ '--accent': s.color }}
            >
              <span className={styles.statCount}>{counts[s.key]}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <ActivityList
            activities={filtered}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            today={today}
          />
        )}
      </main>

      {showForm && (
        <ActivityForm
          activity={editingActivity}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
