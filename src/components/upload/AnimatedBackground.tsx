const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Orb 1 — top-left emerald */}
            <div
                className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-15"
                style={{
                    background:
                        "radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0) 70%)",
                    animation: "float-1 20s ease-in-out infinite",
                }}
            />

            {/* Orb 2 — bottom-right teal */}
            <div
                className="absolute -right-24 -bottom-24 h-[600px] w-[600px] rounded-full opacity-12"
                style={{
                    background:
                        "radial-gradient(circle, rgba(20,184,166,0.35) 0%, rgba(20,184,166,0) 70%)",
                    animation: "float-2 25s ease-in-out infinite",
                }}
            />

            {/* Orb 3 — center-left small accent */}
            <div
                className="absolute top-1/2 left-1/4 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
                style={{
                    background:
                        "radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(34,211,238,0) 70%)",
                    animation: "float-3 18s ease-in-out infinite",
                }}
            />

            {/* Subtle grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
