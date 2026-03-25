import { useState } from 'react';
import styles from './ActivityForm.module.css';

export default function ActivityForm({ activity, onSave, onClose }) {
  const [form, setForm] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    due_date: activity?.due_date || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('O título é obrigatório');
    if (!form.due_date) return setError('A data de vencimento é obrigatória');
    setLoading(true);
    try {
      await onSave(form);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{activity ? 'Editar atividade' : 'Nova atividade'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Título *</label>
            <input
              name="title"
              type="text"
              placeholder="Nome da atividade"
              value={form.title}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label>Descrição</label>
            <textarea
              name="description"
              placeholder="Detalhes opcionais..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>Data de vencimento *</label>
            <input
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Salvando...' : activity ? 'Salvar alterações' : 'Criar atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
