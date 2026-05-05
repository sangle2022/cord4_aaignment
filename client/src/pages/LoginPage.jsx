import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { loginRequest } from '../api/authApi.js';
import { getErrorMessage } from '../api/http.js';
import { useAuth } from '../context/AuthContext.jsx';

const schema = yup
  .object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  })
  .required();

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/payouts';
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginRequest(email, password),
    onSuccess: (payload) => {
      login(payload.token, payload.user);
      toast.success('Signed in');
      navigate(from, { replace: true });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand__mark" aria-hidden>
            ₹
          </span>
        </div>
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">
          Sign in with your demo account — see the README for OPS and FINANCE credentials.
        </p>
        <form
          className="stack stack--loose"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          noValidate
        >
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" {...register('email')} />
            {errors.email ? <span className="error-text">{errors.email.message}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? <span className="error-text">{errors.password.message}</span> : null}
          </div>
          <button className="btn btn--block" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1.5rem', marginBottom: 0, textAlign: 'center', fontSize: '0.85rem' }}>
          Ops and Finance roles use different actions — try both seeded accounts.
        </p>
      </div>
    </div>
  );
}
