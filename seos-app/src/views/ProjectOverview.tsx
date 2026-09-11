import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';

const ProjectOverview: React.FC = () => {
  const projectName = useStore(s => s.projectName);
  const setProjectName = useStore(s => s.setProjectName);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditNameValue(projectName);
  }, [projectName]);

  const handleNameSave = () => {
    if (editNameValue.trim()) {
      setProjectName(editNameValue.trim());
    } else {
      setEditNameValue(projectName);
    }
    setIsEditingName(false);
  };

  const stats = [
    { label: 'Requirements', count: 6, subCount: 2, subLabel: 'approved', icon: '📝' },
    { label: 'User Stories', count: 4, subCount: 2, subLabel: 'approved', icon: '👤' },
    { label: 'Diagrams', count: 1, subCount: 1, subLabel: 'ER Model', icon: '📊' },
    { label: 'Documents', count: 3, subCount: 3, subLabel: 'generated', icon: '📄' }
  ];

  const activities = [
    { 
      title: 'API spec generated: OpenAPI 3.1', 
      desc: 'RESTful endpoints defined for User Auth and Restaurant menus.',
      time: 'Today, 10:45 AM (10 mins ago)', 
      color: 'bg-seos-surface-3' 
    },
    { 
      title: 'Architecture recommended: Event-Driven Microservices', 
      desc: 'System modeling AI suggested a Kafka-based event architecture for real-time order tracking.',
      time: 'Today, 10:25 AM (30 mins ago)', 
      color: 'bg-seos-amber animate-pulse' 
    },
    { 
      title: 'ER diagram modeled with 6 entities', 
      desc: 'Database schema created including Users, Restaurants, Orders, and Delivery tables.',
      time: 'Today, 10:10 AM (45 mins ago)', 
      color: 'bg-seos-green' 
    },
    { 
      title: 'User stories created from requirements', 
      desc: 'Converted 4 core requirements into agile user stories with acceptance criteria.',
      time: 'Yesterday, 4:30 PM', 
      color: 'bg-seos-green' 
    },
    { 
      title: 'Requirements generated from project idea', 
      desc: 'AI Assistant generated 6 new functional requirements based on the initial FoodDash concept prompt.',
      time: 'Yesterday, 3:15 PM', 
      color: 'bg-seos-green' 
    }
  ];

  const techStack = ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Kafka', 'Docker'];

  const pipeline = [
    { name: 'Requirements', status: 'completed' },
    { name: 'User Stories', status: 'completed' },
    { name: 'Modeling', status: 'completed' },
    { name: 'Architecture', status: 'current' },
    { name: 'API Design', status: 'upcoming' },
    { name: 'Documentation', status: 'upcoming' }
  ];

  return (
    <div className="flex flex-col h-full bg-seos-bg text-seos-text p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-seos-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {isEditingName ? (
              <input
                ref={inputRef}
                type="text"
                value={editNameValue}
                onChange={e => setEditNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') {
                    setEditNameValue(projectName);
                    setIsEditingName(false);
                  }
                }}
                className="text-3xl font-bold bg-seos-surface border border-seos-primary rounded px-2 py-1 outline-none text-seos-text"
                autoFocus
              />
            ) : (
              <h1 className="text-3xl font-bold text-seos-text flex items-center gap-3">
                Project Overview — {projectName}
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-seos-text-muted hover:text-seos-primary transition-colors focus:outline-none"
                  title="Edit Project Name"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </h1>
            )}
          </div>
          <p className="text-seos-text-3">Comprehensive system engineering dashboard.</p>
        </div>
        <div className="bg-seos-surface border border-seos-accent/30 text-seos-accent px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-seos-accent animate-pulse"></div>
          In Progress
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-seos-surface border border-seos-border rounded-xl p-5 hover:border-seos-border-2 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="text-3xl font-bold text-seos-text">{stat.count}</div>
                </div>
                <div className="text-seos-text-2 font-medium mb-1">{stat.label}</div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-seos-text-3">{stat.subCount} {stat.subLabel}</span>
                  <div className="w-16 h-1.5 bg-seos-surface-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-seos-accent rounded-full" 
                      style={{ width: `${(stat.subCount / stat.count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Status */}
          <div className="bg-seos-surface border border-seos-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 text-seos-text">Pipeline Status</h3>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-seos-surface-3 -z-10 -translate-y-1/2"></div>
              {pipeline.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-seos-surface text-xs font-bold transition-all
                    ${step.status === 'completed' ? 'bg-seos-green text-black' : 
                      step.status === 'current' ? 'bg-seos-amber text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 
                      'bg-seos-surface-3 text-seos-text-3'}`}
                  >
                    {step.status === 'completed' ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    step.status === 'current' ? 'text-seos-amber' : 
                    step.status === 'completed' ? 'text-seos-text-2' : 'text-seos-text-3'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-seos-surface border border-seos-border rounded-xl p-6 flex-1">
            <h3 className="text-lg font-semibold mb-6 text-seos-text">Recent Activity</h3>
            <div className="flex flex-col gap-6">
              {activities.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center mt-1.5 relative">
                    <div className={`w-3 h-3 rounded-full ${activity.color} z-10 shadow-sm border-2 border-seos-surface`}></div>
                    {i !== activities.length - 1 && (
                      <div className="w-px h-[120%] bg-seos-border absolute top-3"></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 pb-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-seos-text">{activity.title}</span>
                      <span className="text-xs font-medium text-seos-text-3 bg-seos-surface-2 px-2 py-0.5 rounded-md">{activity.time}</span>
                    </div>
                    <span className="text-sm text-seos-text-2 leading-relaxed bg-seos-surface-2/50 p-3 rounded-lg border border-seos-border/50">
                      {activity.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="flex flex-col gap-6">
          {/* Tech Stack */}
          <div className="bg-seos-surface border border-seos-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, i) => (
                <span key={i} className="bg-seos-surface-3 border border-seos-border-2 text-seos-text-2 px-3 py-1.5 rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
