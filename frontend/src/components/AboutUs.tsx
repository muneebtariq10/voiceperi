const AboutUs = () => {
    return (
        <section id="about" className="py-[80px] px-4 md:px-[100px] container mx-auto">
            <div className="rounded-[40px] p-8 md:p-16 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
                <div className="max-w-[850px] mx-auto text-center space-y-6">
                    <h2 className="text-[35px] md:text-[50px] font-bold text-[var(--text-primary)]">About Us</h2>
                    <p className="text-[18px] md:text-[22px] text-[var(--text-secondary)] leading-relaxed font-medium">
                        At Sonervant, we are revolutionizing the way businesses and individuals interact with technology. 
                        Our mission is to empower creators and enterprises with state-of-the-art AI-driven voice tools 
                        that are not only fast and easy to use, but highly accessible.
                    </p>
                    <p className="text-[16px] md:text-[20px] text-[var(--text-secondary)] leading-relaxed">
                        Whether you are looking to automate customer relations, streamline your recruitment process, 
                        or generate impactful audio content, our highly customizable and realistic AI voice assistants 
                        are designed to turn your ideas into impactful experiences.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        <div className="bg-[var(--bg-inset)] p-6 rounded-[20px] border border-[var(--border-default)] text-left hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Innovation</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Pushing the boundaries of what conversational AI can achieve.</p>
                        </div>
                        <div className="bg-[var(--bg-inset)] p-6 rounded-[20px] border border-[var(--border-default)] text-left hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Security</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Ensuring enterprise-grade privacy and data protection at all times.</p>
                        </div>
                        <div className="bg-[var(--bg-inset)] p-6 rounded-[20px] border border-[var(--border-default)] text-left hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Accessibility</h3>
                            <p className="text-[var(--text-secondary)] text-sm">Making powerful voice technologies easy to integrate for everyone.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
