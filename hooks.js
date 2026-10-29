import { useEffect, useState } from 'react';
import { api } from './api';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = () =>
    api.students().then(setStudents).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  return { students, loading, error, reload };
}
