import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'

const LoginButton: React.FC = () => {
  const { handleCredentialResponse } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Firehouse Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your reva16.org account
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={() => {
              console.log('Login Failed')
            }}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </div>
  )
}

export default LoginButton