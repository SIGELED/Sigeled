import { useAuth } from '../context/AuthContext';
import Aside from '../components/Aside';
import BotonesDasboard from '../components/BotonesDasboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="">
      <BotonesDasboard/>
      <Aside/>
    </div>
  );
};

export default Dashboard;