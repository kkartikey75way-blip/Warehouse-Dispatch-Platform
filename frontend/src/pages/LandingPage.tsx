import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Icons.Package className="w-6 h-6" />,
            title: 'Real-Time Tracking',
            description: 'Monitor shipments with live GPS tracking and instant status updates across your entire logistics network.'
        },
        {
            icon: <Icons.Truck className="w-6 h-6" />,
            title: 'Smart Dispatch',
            description: 'Automated dispatch optimization with intelligent route planning and driver assignment algorithms.'
        },
        {
            icon: <Icons.Users className="w-6 h-6" />,
            title: 'Fleet Management',
            description: 'Comprehensive driver profiles, performance tracking, and seamless communication tools.'
        },
        {
            icon: <Icons.BarChart className="w-6 h-6" />,
            title: 'Deep Analytics',
            description: 'Data-driven insights with customizable dashboards and detailed performance metrics.'
        }
    ];

    const stats = [
        { value: '50K+', label: 'Volume Processed' },
        { value: '99.8%', label: 'Delivery Rate' },
        { value: '500+', label: 'Active Fleet' },
        { value: '24/7', label: 'Tech Support' }
    ];

    return (
        <div className="min-h-screen bg-mesh font-sans selection:bg-primary/20">
            <nav className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-txt-main">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Icons.Package className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic">WAREFLOW</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs font-black uppercase tracking-widest text-txt-muted hover:text-primary transition-colors cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-premium btn-primary py-3 px-6"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">
                    <div className="text-center space-y-8">
                        <div className="badge-premium border-primary/20 text-primary inline-flex gap-2 items-center bg-primary/5 animate-fade-in-up opacity-0">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            NEXT-GEN LOGISTICS OS
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-txt-main leading-[0.9] tracking-tighter animate-fade-in-up opacity-0 delay-100">
                            OPTIMIZE YOUR
                            <br />
                            <span className="text-gradient">WAREHOUSE</span>
                        </h1>

                        <p className="text-lg md:text-xl text-txt-muted max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up opacity-0 delay-200">
                            A unified operating system for modern fulfillment. Automated dispatch, real-time fleet intelligence, and terminal analytics in one dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-fade-in-up opacity-0 delay-300">
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-premium btn-primary py-5 px-10 text-xs animate-shimmer"
                            >
                                Start Free Deployment
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-premium bg-white border border-border-subtle text-txt-main hover:bg-slate-50 py-5 px-10 text-xs shadow-xl shadow-slate-200/50"
                            >
                                Access Console
                            </button>
                        </div>
                    </div>

                    <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up opacity-0 delay-400">
                        {stats.map((stat, index) => (
                            <div key={index} className="glass p-8 rounded-3xl text-center hover:scale-105 transition-transform duration-500 hover:shadow-2xl hover:shadow-primary/10">
                                <div className="text-4xl font-black text-txt-main mb-1">{stat.value}</div>
                                <div className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border-subtle/50 animate-fade-in-up opacity-0 delay-500 relative">
                    {}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] glow-pulse pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative z-10">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black text-txt-main tracking-tighter mb-4">
                                Engineered for Scale.
                            </h2>
                            <p className="text-txt-muted font-medium">
                                We built WAREFLOW to handle the complexity of modern logistics so you don't have to. Real-time observability from dock to door.
                            </p>
                        </div>
                        <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline transition-all hover:gap-2 flex items-center group">
                            View Roadmap <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="premium-card group hover:!border-primary/50 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:-rotate-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-black text-txt-main mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-txt-muted text-sm font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                                {}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in-up opacity-0 delay-500">
                    <div className="premium-card bg-txt-main text-white p-12 md:p-20 relative overflow-hidden group animate-shimmer">
                        <div className="relative z-10 max-w-2xl space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-white">
                                Ready to Upgrade Your Operations?
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                Join 500+ fulfillment centers already using WAREFLOW to reduce overhead and improve on-time performance.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-premium btn-primary py-5 px-10 text-xs inline-block relative z-20"
                            >
                                Get Started Now
                            </button>
                        </div>
                        {}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-all duration-1000 glow-pulse" />
                        <div className="absolute bottom-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-1000 animate-float">
                            <Icons.Package className="w-64 h-64" />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border-subtle bg-white/50 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-txt-main flex items-center justify-center text-white">
                            <Icons.Package className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase italic text-txt-main">WAREFLOW</span>
                    </div>
                    <div className="flex gap-8 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                        <a href="#" className="hover:text-primary transition-colors">API</a>
                    </div>
                    <p className="text-xs font-bold text-txt-muted">
                        &copy; 2026 WAREFLOW Systems Inc.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
