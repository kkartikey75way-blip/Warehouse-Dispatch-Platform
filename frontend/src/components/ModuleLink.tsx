import { Link } from "react-router-dom";
import Card from "./Card";

interface ModuleLinkProps {
    to: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

const ModuleLink = ({ to, title, description, icon: Icon, color }: ModuleLinkProps) => (
    <Link to={to} className="group">
        <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
            <div className="mt-6 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Module
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
        </Card>
    </Link>
);

export default ModuleLink;
