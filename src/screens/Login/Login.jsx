import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import MagneticButton from '../../components/ui/MagneticButton';
import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../context/AuthContext';
import { login as loginUser } from '../../lib/mockApi';
import { loginSchema } from '../../lib/validators';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@crucible.dev', password: 'admin123' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await loginUser(values.email, values.password);
      const auth = {
        token: response.data.token,
        role: response.data.role,
        user: response.data.user,
      };
      login(auth);
      navigate(`/dashboard/${response.data.role}`);
    } catch (error) {
      form.setError('root', { message: error.message || 'Login failed.' });
    }
  });

  return (
    <div className={`${styles.page} auth-page`}>
      <Navbar />
      <main className="container auth-shell">
        <motion.div className={styles.loginCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">LOGIN</p>
          <h1>Welcome back.</h1>
          <form onSubmit={onSubmit} className={styles.form}>
            <label>
              Email
              <input type="email" {...form.register('email')} />
              {form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}
            </label>

            <label>
              Password
              <input type="password" {...form.register('password')} />
              {form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}
            </label>

            {form.formState.errors.root && <div className={styles.error}>{form.formState.errors.root.message}</div>}

            <div className={styles.helperRow}>
              <Link to="/forgot-password">Forgot password?</Link>
              <Link to="/register">Create account</Link>
            </div>

            <MagneticButton className="primary" type="submit">Login</MagneticButton>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
