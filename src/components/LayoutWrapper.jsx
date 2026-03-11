import { useAuth } from '../hooks/useAuth';
import Chatbot from './Chatbot';

export default function LayoutWrapper({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {children}
      {isAuthenticated && !isLoading && <Chatbot />}
    </>
  );
}
