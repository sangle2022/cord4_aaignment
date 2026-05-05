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
    <div className="container" style={{ maxWidth: 440 }}>
      <h1>Sign in</h1>
      <p className="muted">Use seeded OPS or FINANCE accounts from the README.</p>
      <form
        className="card stack"
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
        <button className="btn" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
