import AuthRoutes from './AuthRoutes';
import MainRoutes from './MainRoutes';
import useAppContext from '../hooks/useAppContext';

const Navigations = () => {
  const {
    walletState: { initialized, address },
  } = useAppContext();

  if (!initialized) return null;

  // if (!address) 
  return <AuthRoutes />;

  return <MainRoutes />;
};

export default Navigations;
