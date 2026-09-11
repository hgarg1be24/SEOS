
import { useStore } from '../store';

const APIDesigner = () => {
  const MOCK_OPENAPI_YAML = useStore((s) => s.openapiYaml);
  return (
    <div className="animate-fade-in p-6 bg-seos-bg text-seos-text min-h-screen flex flex-col h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-3xl font-bold">API Designer</h1>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-seos-surface-2 text-seos-text-2 rounded-full text-sm font-semibold border border-seos-surface">
            OpenAPI 3.1
          </span>
          <span className="px-3 py-1 bg-seos-accent/20 text-seos-accent rounded-full text-sm font-semibold border border-seos-accent/30 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Auto-Generated
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Side: YAML */}
        <div className="w-[60%] flex flex-col bg-seos-surface rounded-xl border border-seos-surface-2 shadow-inner overflow-hidden">
          <div className="bg-seos-surface-2/50 px-4 py-2 border-b border-seos-surface-2 flex items-center justify-between shrink-0">
            <span className="text-sm font-mono text-seos-text-2">openapi.yaml</span>
            <button className="text-seos-text-2 hover:text-seos-accent transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {MOCK_OPENAPI_YAML?.split('\n').map((line: string, i: number) => {
                if (line.trim().startsWith('#')) {
                  return <div key={i} className="text-seos-text-2">{line}</div>;
                }
                const match = line.match(/^(\s*)([^:]+):(.*)$/);
                if (match) {
                  return (
                    <div key={i}>
                      {match[1]}
                      <span className="text-seos-accent">{match[2]}</span>:
                      {match[3] && match[3].includes('"') ? (
                         <span className="text-seos-green">{match[3]}</span>
                      ) : match[3] && !isNaN(Number(match[3].trim())) && match[3].trim() !== '' ? (
                         <span className="text-seos-amber">{match[3]}</span>
                      ) : (
                         <span className="text-seos-text">{match[3]}</span>
                      )}
                    </div>
                  );
                }
                return <div key={i}>{line}</div>;
              })}
            </pre>
          </div>
        </div>

        {/* Right Side: Swagger UI Mock */}
        <div className="w-[40%] flex flex-col gap-4 overflow-auto pb-4 pr-2">
          
          <div className="bg-seos-surface border-l-4 border-seos-green p-4 rounded shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-seos-green text-black font-bold px-2 py-1 rounded text-xs w-16 text-center">GET</span>
              <span className="font-mono text-seos-text">/api/v1/users</span>
            </div>
            <p className="text-sm text-seos-text-2">List all users in the system</p>
          </div>

          <div className="bg-seos-surface border-l-4 border-blue-500 p-4 rounded shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500 text-white font-bold px-2 py-1 rounded text-xs w-16 text-center">POST</span>
              <span className="font-mono text-seos-text">/api/v1/users</span>
            </div>
            <p className="text-sm text-seos-text-2">Create a new user</p>
          </div>
          
          <div className="bg-seos-surface border-l-4 border-seos-green p-4 rounded shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-seos-green text-black font-bold px-2 py-1 rounded text-xs w-16 text-center">GET</span>
              <span className="font-mono text-seos-text">/api/v1/users/{"{id}"}</span>
            </div>
            <p className="text-sm text-seos-text-2">Get user by ID</p>
          </div>

          <div className="bg-seos-surface border-l-4 border-seos-amber p-4 rounded shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-seos-amber text-black font-bold px-2 py-1 rounded text-xs w-16 text-center">PUT</span>
              <span className="font-mono text-seos-text">/api/v1/users/{"{id}"}</span>
            </div>
            <p className="text-sm text-seos-text-2">Update an existing user</p>
          </div>

          <div className="bg-seos-surface border-l-4 border-red-500 p-4 rounded shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-500 text-white font-bold px-2 py-1 rounded text-xs w-16 text-center">DELETE</span>
              <span className="font-mono text-seos-text">/api/v1/users/{"{id}"}</span>
            </div>
            <p className="text-sm text-seos-text-2">Delete user</p>
          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 mt-6 pt-4 border-t border-seos-surface-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-seos-green bg-seos-green/10 px-4 py-2 rounded-lg border border-seos-green/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="font-semibold">Schema Valid ✓</span>
        </div>
        <button className="bg-seos-accent hover:bg-seos-accent/90 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Validate Schema
        </button>
      </div>

    </div>
  );
};

export default APIDesigner;
