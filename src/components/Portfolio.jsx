import React from "react";
import { FiGithub, FiExternalLink, FiSmartphone, FiShield, FiWifi, FiCpu, FiMessageSquare, FiImage, FiDatabase, FiBriefcase } from "react-icons/fi";
import { motion } from "framer-motion";

const projectData = [
  {
    icon: <FiSmartphone size={24} />,
    title: "Campus++",
    desc: "AI-driven campus ecosystem with AR/3D models, AI Council, mock interviews, code IDE, and performance tracking.",
    tags: ["Flutter", "Node.js", "Gemini AI", "Firebase", "AR/3D"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157/Campus-Plus-Plus",
  },
  {
    icon: <FiShield size={24} />,
    title: "NFC Data Transfer",
    desc: "Secure offline data transfer between devices using NFC technology without internet dependency.",
    tags: ["Flutter", "Dart", "NFC"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiShield size={24} />,
    title: "HealthLock",
    desc: "Secure medical records management with AI-driven health insights and advanced data protection.",
    tags: ["Flutter", "Node.js", "AI/ML"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiCpu size={24} />,
    title: "NayaSetu",
    desc: "AI-based document analysis for financial insights and risk assessment.",
    tags: ["Flutter", "Node.js", "AI/ML"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiCpu size={24} />,
    title: "Smart AI Reminder",
    desc: "Intelligent reminder app with analytics and multi-channel notifications.",
    tags: ["Flutter", "Python", "AI"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiWifi size={24} />,
    title: "IoT Env Monitor",
    desc: "Real-time environmental monitoring system with mobile visualization and hardware integration.",
    tags: ["C++", "Flutter", "IoT"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiSmartphone size={24} />,
    title: "Android Space Game",
    desc: "Immersive 2D/3D space-themed game with engaging mechanics and custom physics.",
    tags: ["Unity", "C#", "Android"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiMessageSquare size={24} />,
    title: "AI Roleplay Chatbot",
    desc: "Empathetic AI chatbot for emotional support and interactive roleplay scenarios.",
    tags: ["GenAI", "HTML/JS", "Web"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiImage size={24} />,
    title: "PicShot",
    desc: "Authentic photo-sharing platform focused on original content and responsive web design.",
    tags: ["PHP", "JS", "HTML/CSS"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiSmartphone size={24} />,
    title: "RKMods App Store",
    desc: "Custom app store with modern UI, application management, and scalable backend.",
    tags: ["Next.js", "PostgreSQL", "React"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiBriefcase size={24} />,
    title: "JobKro",
    desc: "User-friendly job portal connecting job seekers with dynamic employers efficiently.",
    tags: ["PHP", "JS", "HTML/CSS"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
  {
    icon: <FiDatabase size={24} />,
    title: "PostgreSQL Runner",
    desc: "Developer tool for executing, testing, and managing PostgreSQL queries seamlessly.",
    tags: ["PostgreSQL", "SQL", "Tools"],
    link: "https://rakeshinfo.in/",
    github: "https://github.com/rakeshsingh157",
  },
];

const Portfolio = () => {
  return (
    <section id="projects" className="bg-[#020202] py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto text-center mb-20 relative z-10">
        <div className="inline-block px-3 py-1 border border-blue-500/30 bg-blue-500/5 rounded-sm mb-4">
          <p className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.5em]">PROJECT SHOWCASE</p>
        </div>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter"
        >
          Selected Works<span className="text-blue-500">.</span>
        </motion.h2>
        <div className="w-24 h-[1px] bg-blue-500/40 mx-auto"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {projectData.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative p-8 bg-[#0a0a0a] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)] transition-all duration-300 rounded-sm cursor-default flex flex-col items-start h-full"
          >
            {/* Top section with Icon and HUD-like project number */}
            <div className="w-full flex justify-between items-start mb-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-sm text-gray-300 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                {project.icon}
              </div>
              <span className="font-mono text-[9px] text-gray-600 tracking-[0.3em]">PRJ_{String(index + 1).padStart(2, '0')}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight uppercase group-hover:text-blue-400 transition-colors">{project.title}</h3>
            
            {/* Description */}
            <p className="text-gray-500 font-light text-sm leading-relaxed mb-6 flex-grow">
              {project.desc}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[9px] uppercase tracking-widest font-mono px-2 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-sm group-hover:border-blue-500/20 group-hover:text-blue-300 transition-colors">
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer / Links */}
            <div className="mt-auto flex gap-4 w-full pt-6 border-t border-white/[0.05]">
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">
                <FiGithub size={14} /> <span>Code</span>
              </a>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors ml-auto">
                <span>Demo</span> <FiExternalLink size={14} />
              </a>
            </div>
            
            {/* HUD Corner Lines on hover */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-blue-500/0 group-hover:border-blue-500/50 transition-colors"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-blue-500/0 group-hover:border-blue-500/50 transition-colors"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-blue-500/0 group-hover:border-blue-500/50 transition-colors"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-blue-500/0 group-hover:border-blue-500/50 transition-colors"></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Portfolio;
