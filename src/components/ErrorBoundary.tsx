import React, { ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-red-100 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 font-medium mb-8">
              Ocorreu um erro inesperado ao carregar a plataforma. Nossa equipe técnica já foi notificada.
            </p>
            
            <div className="bg-red-50 p-4 rounded-2xl mb-8 text-left overflow-auto max-h-40">
              <p className="text-xs font-mono text-red-700 break-words">
                {this.state.error?.message}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
