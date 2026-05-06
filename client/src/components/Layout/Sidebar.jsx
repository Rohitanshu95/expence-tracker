import { LayoutDashboard, Wallet, CreditCard, PieChart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all group",
      active 
        ? "bg-primary text-white shadow-md shadow-primary/30" 
        : "text-text-muted hover:bg-background hover:text-text-primary"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? "text-white" : "group-hover:text-primary transition-colors"} />
      <span className="font-medium">{label}</span>
    </div>
    {active && <ChevronRight size={16} />}
  </button>
);

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="w-72 h-screen bg-background-secondary border-r border-border flex flex-col p-6 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
          <PieChart className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">ExpenseFlow</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
        <SidebarItem icon={Wallet} label="Transactions" />
        <SidebarItem icon={CreditCard} label="Budgets" />
        <SidebarItem icon={PieChart} label="Analytics" />
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-border space-y-2">
        <SidebarItem icon={Settings} label="Settings" />
        <SidebarItem icon={LogOut} label="Logout" onClick={logout} />
      </div>
    </div>
  );
};

export default Sidebar;
